import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/admin/settings?key=pickup_location
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  const query = adminClient().from("settings").select("key, value")
  const { data, error } = key ? await query.eq("key", key) : await query

  if (error) {
    console.error("[settings] GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data ?? [])
}

// POST /api/admin/settings  body: { key, value }
export async function POST(req: NextRequest) {
  const { key, value } = await req.json()
  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 })
  }

  const { error } = await adminClient()
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" })

  if (error) {
    console.error("[settings] POST error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
