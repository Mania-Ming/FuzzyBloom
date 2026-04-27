import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 })
    }

    // Find matching unused, unexpired code
    const { data, error } = await supabaseAdmin
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 })
    }

    // Mark code as used
    await supabaseAdmin
      .from("verification_codes")
      .update({ used: true })
      .eq("id", data.id)

    // Mark profile as verified
    await supabaseAdmin
      .from("profiles")
      .update({ is_verified: true })
      .eq("id", data.user_id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 })
  }
}
