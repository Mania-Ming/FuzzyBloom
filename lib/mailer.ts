import nodemailer from "nodemailer"
import { verificationEmailHTML, orderStatusEmailHTML } from "@/lib/emailTemplate"

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  })
}

export async function sendVerificationEmail(to: string, userName: string, code: string) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"FuzzyBloom" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your Verification Code - FuzzyBloom",
    html: verificationEmailHTML(userName, code, 10),
  })
}

type OrderEmailPayload = {
  to: string
  customerName: string
  orderId: string
  status: "Confirmed" | "Preparing" | "Out for Delivery" | "Delivered"
  items: { name: string; price: number; qty?: number; quantity?: number }[]
  totalAmount: number
  riderName?: string
  riderPhone?: string
}

const STATUS_SUBJECTS: Record<OrderEmailPayload["status"], string> = {
  Confirmed:          "Your Order Has Been Confirmed! 🌸 - FuzzyBloom",
  Preparing:          "Your Order is Being Prepared! 🎀 - FuzzyBloom",
  "Out for Delivery": "Your Order is On Its Way! 🚴 - FuzzyBloom",
  Delivered:          "Your Order Has Been Delivered! 🎉 - FuzzyBloom",
}

export async function sendOrderEmail(payload: OrderEmailPayload) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"FuzzyBloom" <${process.env.GMAIL_USER}>`,
    to: payload.to,
    subject: STATUS_SUBJECTS[payload.status],
    html: orderStatusEmailHTML(payload),
  })
}
