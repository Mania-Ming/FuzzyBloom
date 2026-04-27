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
  `.trim();
}
