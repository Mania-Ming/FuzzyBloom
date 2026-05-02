import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/orders  — admin fetch all orders with delivery details + profile
export async function GET() {
  const db = adminClient()

  const { data: orders, error } = await db
    .from("orders")
    .select(`
      id, user_id, total_amount, status, created_at, items, payment, receipt_url,
      profiles!orders_user_id_fkey ( full_name, email, contact_number, address ),
      delivery_details (
        delivery_type, full_name, phone, address,
        delivery_date, delivery_time, rider_id
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[orders GET] error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const normalized = (orders ?? []).map((o: any) => ({
    ...o,
    profiles: Array.isArray(o.profiles) ? (o.profiles[0] ?? null) : (o.profiles ?? null),
    delivery_details: Array.isArray(o.delivery_details)
      ? (o.delivery_details[0] ?? null)
      : (o.delivery_details ?? null),
  }))

  return NextResponse.json(normalized)
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

    // 0. Sold-out guard — check all items are still available
    const productIds = (order.items as any[]).map((i: any) => i.product_id).filter(Boolean)
    if (productIds.length > 0) {
      const { data: products } = await db
        .from("products")
        .select("id, name, is_available")
        .in("id", productIds)
      const soldOut = (products ?? []).filter(p => p.is_available === false)
      if (soldOut.length > 0) {
        return NextResponse.json(
          { error: `Some items are no longer available: ${soldOut.map((p: any) => p.name).join(", ")}` },
          { status: 400 }
        )
      }
    }

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
        await db.from("delivery_details").delete().eq("order_id", orderId)
        await db.from("orders").delete().eq("id", orderId)
        return NextResponse.json({ error: "Failed to save order items: " + itemsError.message }, { status: 500 })
      }
    }

    // 4. Seed initial status history row (Pending)
    await db.from("order_status_history").insert({ order_id: orderId, status: "Pending" })

    return NextResponse.json({ success: true, orderId })

  } catch (err: any) {
    console.error("[orders] unexpected error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
