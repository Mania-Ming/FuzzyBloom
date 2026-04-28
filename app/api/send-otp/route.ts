import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendVerificationEmail } from "@/lib/mailer"

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === "your_service_role_key_here") {
      console.error("[send-otp] Missing or invalid SUPABASE_SERVICE_ROLE_KEY")
      return NextResponse.json({ error: "Server misconfiguration: missing Supabase service role key" }, { status: 500 })
    }
    if (!gmailUser || !gmailPass) {
      console.error("[send-otp] Missing Gmail credentials")
      return NextResponse.json({ error: "Server misconfiguration: missing Gmail credentials" }, { status: 500 })
    }

    const { email, full_name, user_id } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const code = generateOTP()
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabaseAdmin.from("verification_codes").delete().eq("email", email).eq("used", false)

    const { error: dbError } = await supabaseAdmin.from("verification_codes").insert({
      ...(user_id ? { user_id } : {}),
      email,
      code,
      expires_at,
      used: false,
    })

    if (dbError) {
      console.error("[send-otp] Supabase insert error:", dbError.message)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    await sendVerificationEmail(email, full_name || "there", code)

    console.log(`[send-otp] OTP sent to ${email}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[send-otp] Unexpected error:", err.message)
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 })
  }
}
