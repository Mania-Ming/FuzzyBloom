import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order, deliveryDetails, orderItems } = body

    // Validate required fields
    if (!order?.user_id || !order?.items || order?.total_amount == null) {
      return NextResponse.json({ error: "Missing required order fields." }, { status: 400 })
    }

    const db = adminClient()

    // 1. Insert order
    const { data: insertedOrder, error: orderError } = await db
      .from("orders")
      .insert([order])
      .select()
      .single()

    if (orderError) {
      console.error("[orders] insert error:", orderError.message)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    const orderId = insertedOrder.id

    // 2. Insert delivery details
    if (deliveryDetails) {
      const { error: ddError } = await db
        .from("delivery_details")
        .insert([{ ...deliveryDetails, order_id: orderId }])

      if (ddError) {
        console.error("[orders] delivery_details error:", ddError.message)
        // Rollback order
        await db.from("orders").delete().eq("id", orderId)
        return NextResponse.json({ error: "Failed to save delivery details: " + ddError.message }, { status: 500 })
      }
    }

    // 3. Insert order items
    if (orderItems?.length > 0) {
      const { error: itemsError } = await db
        .from("order_items")
        .insert(orderItems.map((item: any) => ({ ...item, order_id: orderId })))

      if (itemsError) {
        console.error("[orders] order_items error:", itemsError.message)
        // Rollback
        await db.from("delivery_details").delete().eq("order_id", orderId)
        await db.from("orders").delete().eq("id", orderId)
        return NextResponse.json({ error: "Failed to save order items: " + itemsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, orderId })

  } catch (err: any) {
    console.error("[orders] unexpected error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
