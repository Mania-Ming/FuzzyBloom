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
    from: `"FuzzyBloom Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `New inquiry about "${productName}"`,
    html: `
      <p><strong>From:</strong> ${email}</p>
      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  })

  return NextResponse.json({ ok: true })
}
