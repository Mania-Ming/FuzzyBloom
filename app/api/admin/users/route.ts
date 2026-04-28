import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, role, is_verified, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[admin/users] fetch error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function PATCH(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { id, role } = await req.json()
  if (!id || !role) return NextResponse.json({ error: "Missing id or role" }, { status: 400 })

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", id)

  if (error) {
    console.error("[admin/users] role update error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
