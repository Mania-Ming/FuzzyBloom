// ─── Verification Email ───────────────────────────────────────────────────────

export function verificationEmailHTML(userName: string, code: string, expiresInMinutes = 10) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#7c3aed;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">🌸 FuzzyBloom</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 12px;font-size:16px;color:#333;">Hi <strong>${userName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                We received a request to verify your account. Use the code below to continue.
              </p>

              <!-- Code Box -->
              <div style="text-align:center;margin:28px 0;">
                <span style="display:inline-block;background:#f3e8ff;border:2px dashed #7c3aed;border-radius:10px;padding:18px 48px;font-size:36px;font-weight:bold;letter-spacing:10px;color:#7c3aed;">
                  ${code}
                </span>
              </div>

              <p style="margin:0 0 8px;font-size:14px;color:#888;text-align:center;">
                ⏱ This code expires in <strong>${expiresInMinutes} minutes</strong>.
              </p>

              <!-- Security Notice -->
              <div style="margin:28px 0 0;background:#fff8f0;border-left:4px solid #f59e0b;border-radius:4px;padding:14px 18px;">
                <p style="margin:0;font-size:13px;color:#92400e;">
                  🔒 <strong>Security reminder:</strong> Never share this code with anyone — including our support team. FuzzyBloom will never ask for your verification code.
                </p>
              </div>

              <p style="margin:24px 0 0;font-size:14px;color:#555;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;font-size:13px;color:#aaa;">
                Need help? Contact us at
                <a href="mailto:support@fuzzybloom.com" style="color:#7c3aed;text-decoration:none;">support@fuzzybloom.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#ccc;">© ${new Date().getFullYear()} FuzzyBloom. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// ─── Order Status Email ───────────────────────────────────────────────────────

type OrderEmailData = {
  customerName: string
  orderId: string
  status: "Confirmed" | "Out for Delivery" | "Delivered"
  items: { name: string; price: number; qty?: number; quantity?: number }[]
  totalAmount: number
  riderName?: string
  riderPhone?: string
}

const STATUS_META: Record<OrderEmailData["status"], { emoji: string; heading: string; color: string; message: string }> = {
  Confirmed: {
    emoji: "✅",
    heading: "Order Confirmed!",
    color: "#2563eb",
    message: "Great news! We've confirmed your order and it's now being prepared.",
  },
  "Out for Delivery": {
    emoji: "🚴",
    heading: "Your Order is On Its Way!",
    color: "#7c3aed",
    message: "Your order has been picked up and is heading to you now.",
  },
  Delivered: {
    emoji: "🎉",
    heading: "Order Delivered!",
    color: "#16a34a",
    message: "Your order has been delivered. We hope you love it!",
  },
}

export function orderStatusEmailHTML(data: OrderEmailData): string {
  const meta = STATUS_META[data.status]
  const shortId = data.orderId.slice(0, 8).toUpperCase()

  const itemRows = data.items.map(item => {
    const qty = item.qty ?? item.quantity ?? 1
    return `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">${item.name}</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:center;">x${qty}</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:right;">₱${(Number(item.price) * qty).toLocaleString()}</td>
      </tr>`
  }).join("")

  const riderBlock = data.riderName ? `
    <div style="margin:20px 0 0;background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:4px;padding:14px 18px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#5b21b6;">🚴 Rider Information</p>
      <p style="margin:0;font-size:14px;color:#374151;"><strong>${data.riderName}</strong></p>
      ${data.riderPhone ? `<p style="margin:4px 0 0;font-size:14px;color:#6b7280;">📞 ${data.riderPhone}</p>` : ""}
    </div>` : ""

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Update</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:${meta.color};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">🌸 FuzzyBloom</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">${meta.emoji} ${meta.heading}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 12px;font-size:16px;color:#333;">Hi <strong>${data.customerName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">${meta.message}</p>

              <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:bold;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Order #${shortId}</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <thead>
                    <tr>
                      <th style="font-size:12px;color:#9ca3af;text-align:left;padding-bottom:8px;">Item</th>
                      <th style="font-size:12px;color:#9ca3af;text-align:center;padding-bottom:8px;">Qty</th>
                      <th style="font-size:12px;color:#9ca3af;text-align:right;padding-bottom:8px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemRows}</tbody>
                </table>
                <div style="border-top:2px solid #e5e7eb;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;">
                  <span style="font-size:15px;font-weight:bold;color:#111827;">Total</span>
                  <span style="font-size:15px;font-weight:bold;color:#4b2e2e;">₱${Number(data.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              ${riderBlock}

              <p style="margin:24px 0 0;font-size:14px;color:#555;">You can track your order anytime from your <strong>Orders</strong> page.</p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;font-size:13px;color:#aaa;">
                Questions? Contact us at
                <a href="mailto:support@fuzzybloom.com" style="color:#7c3aed;text-decoration:none;">support@fuzzybloom.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#ccc;">© ${new Date().getFullYear()} FuzzyBloom. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
