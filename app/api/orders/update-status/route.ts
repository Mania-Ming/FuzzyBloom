import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderEmail } from "@/lib/mailer"

const EMAIL_STATUSES = new Set(["Confirmed", "Preparing", "Out for Delivery", "Delivered"])

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status } = await req.json()
    console.log(`[update-status] orderId=${orderId} status=${status}`)

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required." }, { status: 400 })
    }

    const db = adminClient()

    // 1. Update order status
    const { error: updateError } = await db
      .from("orders")
      .update({ status })
      .eq("id", orderId)

    if (updateError) {
      console.error("[update-status] DB update failed:", updateError.message)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    console.log(`[update-status] DB updated to "${status}"`)

    // 2. Log status history
    await db.from("order_status_history").insert({ order_id: orderId, status })

    // 3. Send email for relevant statuses
    if (!EMAIL_STATUSES.has(status)) {
      console.log(`[update-status] No email for status "${status}"`)
      return NextResponse.json({ success: true })
    }

    // Fetch order + user_id
    const { data: orderData, error: orderErr } = await db
      .from("orders")
      .select("id, user_id, total_amount, items")
      .eq("id", orderId)
      .single()

    if (orderErr || !orderData) {
      console.error("[update-status] Failed to fetch order:", orderErr?.message)
      return NextResponse.json({ success: true }) // status updated, email skipped
    }

    // Fetch user email directly from auth.users (always reliable)
    const { data: userData, error: userErr } = await db.auth.admin.getUserById(orderData.user_id)
    if (userErr || !userData?.user?.email) {
      console.error("[update-status] Failed to fetch user email:", userErr?.message)
      return NextResponse.json({ success: true })
    }

    // Fetch profile name from profiles table
    const { data: profileData } = await db
      .from("profiles")
      .select("full_name")
      .eq("id", orderData.user_id)
      .maybeSingle()

    // Fetch rider info for Out for Delivery
    const { data: ddData } = await db
      .from("delivery_details")
      .select("riders ( name, phone )")
      .eq("order_id", orderId)
      .maybeSingle()

    const rider = (ddData as any)?.riders
    const customerEmail = userData.user.email
    const customerName  = profileData?.full_name ?? userData.user.email

    console.log(`[update-status] Sending email to ${customerEmail} for status "${status}"`)
    if (status === "Out for Delivery") {
      console.log(`[update-status] Rider: ${rider?.name ?? "none"} / ${rider?.phone ?? "none"}`)
    }

    await sendOrderEmail({
      to:           customerEmail,
      customerName: customerName,
      orderId:      orderData.id,
      status:       status as "Confirmed" | "Preparing" | "Out for Delivery" | "Delivered",
      items:        Array.isArray(orderData.items) ? orderData.items : [],
      totalAmount:  orderData.total_amount,
      riderName:    status === "Out for Delivery" ? rider?.name  : undefined,
      riderPhone:   status === "Out for Delivery" ? rider?.phone : undefined,
    })

    console.log(`[update-status] Email sent successfully to ${customerEmail}`)
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("[update-status] Unexpected error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
