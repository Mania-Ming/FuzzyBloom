"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

function getStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: "", color: "", width: "0%" }
  const hasLetter = /[a-zA-Z]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const score = [hasLetter, hasNumber, pw.length >= 6, pw.length >= 10].filter(Boolean).length
  if (score <= 1) return { label: "Weak", color: "bg-red-400", width: "33%" }
  if (score <= 2) return { label: "Medium", color: "bg-yellow-400", width: "66%" }
  return { label: "Strong", color: "bg-green-500", width: "100%" }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const strength = getStrength(password)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    if (password !== confirm) { setError("Passwords do not match."); return }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => router.replace("/login"), 2500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-up">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <img src="/logo.jpg" alt="logo" className="w-16 h-16 rounded-full object-cover ring-4 ring-[#4b2e2e]/10 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">Choose a new secure password.</p>
          </div>

          {done ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
              <p className="font-semibold text-gray-800">Password updated!</p>
              <p className="text-sm text-gray-500">Redirecting you to login...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500">Verifying reset link...</p>
              <p className="text-xs text-gray-400">If this takes too long, your link may have expired.</p>
              <Link href="/forgot-password" className="inline-block text-[#4b2e2e] text-sm font-semibold hover:underline">
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}>
                    <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="flex gap-2 text-gray-400">
                        <span className={password.length >= 6 ? "text-green-500" : ""}>✓ 6+ chars</span>
                        <span className={/[a-zA-Z]/.test(password) ? "text-green-500" : ""}>✓ letters</span>
                        <span className={/\d/.test(password) ? "text-green-500" : ""}>✓ numbers</span>
                      </span>
                      <span className={
                        strength.label === "Strong" ? "text-green-500 font-semibold" :
                        strength.label === "Medium" ? "text-yellow-500 font-semibold" :
                        "text-red-400 font-semibold"
                      }>{strength.label}</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 bg-gray-50/80 text-sm transition ${confirm && confirm !== password ? "border-red-300" : "border-gray-200 focus:border-[#4b2e2e]"}`}
                  required
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4b2e2e] text-white py-3 rounded-full hover:bg-[#3a2323] transition font-semibold text-sm shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
