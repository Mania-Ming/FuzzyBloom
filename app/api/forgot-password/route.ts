import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createClient } from "@supabase/supabase-js"

const SITE_URL = "https://fuzzy-bloom.vercel.app"

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const gmailUser      = process.env.GMAIL_USER
    const gmailPass      = process.env.GMAIL_APP_PASSWORD

    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === "your_service_role_key_here") {
      return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 })
    }
    if (!gmailUser || !gmailPass) {
      return NextResponse.json({ error: "Email service not configured." }, { status: 500 })
    }

    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 })

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Generate a password reset link using the admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email.trim().toLowerCase(),
      options: { redirectTo: `${SITE_URL}/update-password` },
    })

    if (error) {
      // Don't reveal whether the email exists — always return success to the client
      console.error("[forgot-password] generateLink error:", error.message)
      return NextResponse.json({ success: true })
    }

    const resetLink = data.properties?.action_link
    if (!resetLink) {
      console.error("[forgot-password] No action_link returned")
      return NextResponse.json({ success: true })
    }

    // Send via Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPass },
    })

    await transporter.sendMail({
      from: `"FuzzyBloom" <${gmailUser}>`,
      to: email,
      subject: "Reset Your Password – FuzzyBloom",
      html: resetEmailHTML(resetLink),
    })

    console.log(`[forgot-password] Reset link sent to ${email}`)
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("[forgot-password] Unexpected error:", err.message)
    return NextResponse.json({ error: "Failed to send reset email." }, { status: 500 })
  }
}

function resetEmailHTML(resetLink: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:#4b2e2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">🌸 FuzzyBloom</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 12px;font-size:16px;color:#333;">Hi there,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                We received a request to reset your FuzzyBloom password. Click the button below to choose a new one.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}"
                   style="display:inline-block;background:#4b2e2e;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:bold;letter-spacing:0.5px;">
                  Reset My Password
                </a>
              </div>

              <p style="margin:0 0 8px;font-size:13px;color:#888;text-align:center;">
                This link expires in <strong>1 hour</strong>. If you didn't request a reset, ignore this email.
              </p>

              <div style="margin:28px 0 0;background:#fff8f0;border-left:4px solid #f59e0b;border-radius:4px;padding:14px 18px;">
                <p style="margin:0;font-size:13px;color:#92400e;">
                  🔒 <strong>Security tip:</strong> FuzzyBloom will never ask for your password. If you didn't request this, your account is safe.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">© ${new Date().getFullYear()} FuzzyBloom. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}
