import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createClient } from "@supabase/supabase-js"
import { verificationEmailHTML } from "@/lib/emailTemplate"

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    // Validate env vars first
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

    // Create admin client inline so it always uses fresh env vars
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const code = generateOTP()
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Delete any existing unused codes for this email
    await supabaseAdmin.from("verification_codes").delete().eq("email", email).eq("used", false)

    // Insert new OTP
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

    // Send email via Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPass },
    })

    await transporter.sendMail({
      from: `"FuzzyBloom" <${gmailUser}>`,
      to: email,
      subject: "Your Verification Code - FuzzyBloom",
      html: verificationEmailHTML(full_name || "there", code, 10),
    })

    console.log(`[send-otp] OTP sent to ${email}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[send-otp] Unexpected error:", err.message)
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 })
  }
}
