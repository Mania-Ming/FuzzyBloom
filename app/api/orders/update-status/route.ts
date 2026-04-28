import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderEmail } from "@/lib/mailer"

const EMAIL_STATUSES = new Set(["Confirmed", "Out for Delivery", "Delivered"])

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

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required." }, { status: 400 })
    }

    const db = adminClient()

    // 1. Update order status
    const { error: updateError } = await db
      .from("orders")
      .update({ status })
      .eq("id", orderId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    // 2. Log status history
    await db.from("order_status_history").insert({ order_id: orderId, status })

    // 3. Send email for relevant statuses
    if (EMAIL_STATUSES.has(status)) {
      const [orderRes, ddRes] = await Promise.all([
        db.from("orders")
          .select("id, total_amount, items, profiles!orders_user_id_fkey ( full_name, email )")
          .eq("id", orderId)
          .single(),
        db.from("delivery_details")
          .select("riders ( name, phone )")
          .eq("order_id", orderId)
          .maybeSingle(),
      ])

      if (!orderRes.error && orderRes.data) {
        const order = orderRes.data as any
        const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
        const rider = (ddRes.data as any)?.riders

        if (profile?.email) {
          await sendOrderEmail({
            to:           profile.email,
            customerName: profile.full_name ?? "Customer",
            orderId:      order.id,
            status:       status as "Confirmed" | "Out for Delivery" | "Delivered",
            items:        Array.isArray(order.items) ? order.items : [],
            totalAmount:  order.total_amount,
            riderName:    status === "Out for Delivery" ? rider?.name  : undefined,
            riderPhone:   status === "Out for Delivery" ? rider?.phone : undefined,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[update-status] error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
