import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  const { email, message, productName } = await req.json()

  if (!email || !message || !productName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  })

  await transporter.sendMail({
    from: `"FuzzyBloom" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `New Inquiry – ${productName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #eee;border-radius:12px;">
        <h2 style="margin:0 0 4px;font-size:18px;color:#2a1515;">New Inquiry</h2>
        <p style="margin:0 0 24px;font-size:13px;color:#888;">Someone sent you a message via FuzzyBloom.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#555;width:110px;vertical-align:top;">From</td>
            <td style="padding:8px 0;color:#111;font-weight:600;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555;vertical-align:top;">Product</td>
            <td style="padding:8px 0;color:#111;">${productName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555;vertical-align:top;">Message</td>
            <td style="padding:8px 0;color:#111;line-height:1.6;">${message.replace(/\n/g, "<br/>")}</td>
          </tr>
        </table>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
        <p style="font-size:12px;color:#aaa;margin:0;">Reply directly to this email to respond to the customer.</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
