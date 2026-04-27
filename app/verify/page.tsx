"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function VerifyPage() {
  const router = useRouter()
  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [userId, setUserId] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const e = sessionStorage.getItem("verify_email") || ""
    const n = sessionStorage.getItem("verify_name") || ""
    const u = sessionStorage.getItem("verify_user_id") || ""
    if (!e || !u) { router.replace("/register"); return }
    setEmail(e)
    setFullName(n)
    setUserId(u)
  }, [router])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const updated = [...digits]
    updated[index] = value.slice(-1)
    setDigits(updated)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(""))
      inputRefs.current[5]?.focus()
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const code = digits.join("")
    if (code.length < 6) { setErrorMsg("Please enter the full 6-digit code."); return }

    setIsPending(true)
    setErrorMsg("")
    setSuccessMsg("")

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    })

    const json = await res.json()

    if (!res.ok) {
      setErrorMsg(json.error || "Invalid code. Please try again.")
      setIsPending(false)
      return
    }

    sessionStorage.removeItem("verify_email")
    sessionStorage.removeItem("verify_name")
    sessionStorage.removeItem("verify_user_id")

    setSuccessMsg("Email verified! Redirecting to login...")
    setTimeout(() => router.push("/login"), 1500)
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setIsResending(true)
    setErrorMsg("")
    setSuccessMsg("")

    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name: fullName, user_id: userId }),
    })

    const json = await res.json()
    setIsResending(false)

    if (!res.ok) {
      setErrorMsg(json.error || "Failed to resend code.")
      return
    }

    setDigits(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
    setSuccessMsg("A new code has been sent to your email.")
    setResendCooldown(60)
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <img src="/logo.jpg" alt="logo" className="w-16 h-16 rounded-full object-cover ring-4 ring-[#4b2e2e]/10 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#4b2e2e] focus:ring-2 focus:ring-[#4b2e2e]/20 bg-gray-50 transition"
                />
              ))}
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-green-600 text-sm text-center">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#4b2e2e] text-white py-3 rounded-full hover:bg-[#3a2323] transition font-semibold text-sm shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60"
            >
              {isPending ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">Didn&apos;t receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="mt-1 text-sm font-semibold text-[#4b2e2e] hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Code"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            <Link href="/register" className="text-[#4b2e2e] font-semibold hover:underline">
              ← Back to Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
