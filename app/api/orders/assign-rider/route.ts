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
    const { orderId, riderId } = await req.json()
    if (!orderId || !riderId) {
      return NextResponse.json({ error: "orderId and riderId are required." }, { status: 400 })
    }

    const db = adminClient()
    const { error } = await db
      .from("delivery_details")
      .update({ rider_id: riderId })
      .eq("order_id", orderId)

    if (error) throw error

    // Return the updated delivery_details with rider joined
    const { data } = await db
      .from("delivery_details")
      .select("delivery_type, full_name, phone, address, delivery_date, delivery_time, rider_id, riders ( id, name, phone )")
      .eq("order_id", orderId)
      .maybeSingle()

    return NextResponse.json({ success: true, delivery_details: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
