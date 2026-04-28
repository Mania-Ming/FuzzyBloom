import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type RouteContext = { params: Promise<{ id: string }> }

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const db = adminClient()

  const [orderRes, ddRes, historyRes, ridersRes] = await Promise.all([
    db.from("orders")
      .select("id, total_amount, payment, status, created_at, receipt_url, items")
      .eq("id", id)
      .single(),

    db.from("delivery_details")
      .select("delivery_type, full_name, phone, address, delivery_date, delivery_time, rider_id, riders ( id, name, phone )")
      .eq("order_id", id)
      .maybeSingle(),

    db.from("order_status_history")
      .select("status, changed_at")
      .eq("order_id", id)
      .order("changed_at", { ascending: true }),

    db.from("riders").select("id, name, phone").order("name"),
  ])

  if (orderRes.error) {
    console.error("[orders/:id] fetch error:", orderRes.error.message)
    return NextResponse.json({ error: orderRes.error.message }, { status: 500 })
  }

  return NextResponse.json({
    order:         { ...orderRes.data, delivery_details: ddRes.data ?? null },
    statusHistory: historyRes.data ?? [],
    riders:        ridersRes.data ?? [],
  })
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const db = adminClient()
  const body = await req.json()

  if (body.status) {
    const { error } = await db.from("orders").update({ status: body.status }).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await db.from("order_status_history").insert({ order_id: id, status: body.status })
    return NextResponse.json({ success: true })
  }

  if (body.rider_id !== undefined) {
    const { error } = await db.from("delivery_details")
      .update({ rider_id: body.rider_id })
      .eq("order_id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const db = adminClient()

  await db.from("order_status_history").delete().eq("order_id", id)
  await db.from("order_items").delete().eq("order_id", id)
  await db.from("delivery_details").delete().eq("order_id", id)

  const { error } = await db.from("orders").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
