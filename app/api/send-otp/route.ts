import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { verificationEmailHTML } from "@/lib/emailTemplate"

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, full_name, user_id } = await req.json()

    if (!email || !user_id) {
      return NextResponse.json({ error: "Missing email or user_id" }, { status: 400 })
    }

    const code = generateOTP()
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Delete any existing unused codes for this email
    await supabaseAdmin
      .from("verification_codes")
      .delete()
      .eq("email", email)
      .eq("used", false)

    // Insert new OTP
    const { error: dbError } = await supabaseAdmin.from("verification_codes").insert({
      user_id,
      email,
      code,
      expires_at,
      used: false,
    })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Send email via Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"FuzzyBloom" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code - FuzzyBloom",
      html: verificationEmailHTML(full_name || "there", code, 10),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 })
  }
}
