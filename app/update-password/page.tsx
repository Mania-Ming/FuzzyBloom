"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

function validate(pw: string): string | null {
  if (pw.length < 8)          return "Password must be at least 8 characters."
  if (!/[a-zA-Z]/.test(pw))  return "Password must contain at least one letter."
  if (!/\d/.test(pw))         return "Password must contain at least one number."
  return null
}

function getStrength(pw: string) {
  if (!pw) return { label: "", color: "", width: "0%" }
  const score = [pw.length >= 8, /[a-zA-Z]/.test(pw), /\d/.test(pw), pw.length >= 12].filter(Boolean).length
  if (score <= 2) return { label: "Weak",   color: "bg-red-400",    width: "33%" }
  if (score === 3) return { label: "Medium", color: "bg-yellow-400", width: "66%" }
  return               { label: "Strong", color: "bg-green-500",  width: "100%" }
}

type State = "loading" | "ready" | "done" | "invalid"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [state, setState]         = useState<State>("loading")
  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [showPw, setShowPw]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState("")
  const strength = getStrength(password)

  useEffect(() => {
    // The reset email link lands here with a URL hash like:
    // /update-password#access_token=xxx&refresh_token=yyy&type=recovery
    // We parse it manually and call setSession so it works reliably.
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const accessToken  = params.get("access_token")
    const refreshToken = params.get("refresh_token")
    const type         = params.get("type")

    if (!accessToken || !refreshToken || type !== "recovery") {
      // No token in hash — check if there's already a valid session (page refresh)
      supabase.auth.getSession().then(({ data: { session } }) => {
        setState(session ? "ready" : "invalid")
      })
      return
    }

    // Exchange the tokens for a live session
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          console.error("[update-password] setSession error:", error.message)
          setState("invalid")
        } else {
          // Clear the hash from the URL so tokens aren't visible
          window.history.replaceState(null, "", window.location.pathname)
          setState("ready")
        }
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate(password)
    if (validationError) { setError(validationError); return }
    if (password !== confirm) { setError("Passwords do not match."); return }

    setSubmitting(true)
    setError("")

    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (error) { setError(error.message); return }

    await supabase.auth.signOut()
    setState("done")
    setTimeout(() => router.replace("/login"), 2500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-up">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <img src="/logo.jpg" alt="logo" className="w-16 h-16 rounded-full object-cover ring-4 ring-[#4b2e2e]/10 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Update Password</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">Choose a new secure password.</p>
          </div>

          {/* LOADING */}
          {state === "loading" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-10 h-10 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 font-medium">Verifying your reset link...</p>
            </div>
          )}

          {/* INVALID */}
          {state === "invalid" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto text-2xl">⚠️</div>
              <p className="font-semibold text-gray-800">Link expired or invalid</p>
              <p className="text-sm text-gray-500">This reset link has expired or already been used.</p>
              <Link href="/forgot-password"
                className="inline-block mt-2 bg-[#4b2e2e] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3a2323] transition">
                Request a new link
              </Link>
            </div>
          )}

          {/* SUCCESS */}
          {state === "done" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto text-2xl">✅</div>
              <p className="font-semibold text-gray-800">Password updated!</p>
              <p className="text-sm text-gray-500">Redirecting you to login...</p>
            </div>
          )}

          {/* FORM */}
          {state === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError("") }}
                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}>
                    <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="flex gap-2.5 text-gray-400">
                        <span className={password.length >= 8       ? "text-green-500" : ""}>✓ 8+ chars</span>
                        <span className={/[a-zA-Z]/.test(password)  ? "text-green-500" : ""}>✓ letters</span>
                        <span className={/\d/.test(password)        ? "text-green-500" : ""}>✓ numbers</span>
                      </span>
                      {strength.label && (
                        <span className={
                          strength.label === "Strong" ? "text-green-500 font-bold" :
                          strength.label === "Medium" ? "text-yellow-500 font-bold" :
                          "text-red-400 font-bold"
                        }>{strength.label}</span>
                      )}
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
                  onChange={e => { setConfirm(e.target.value); setError("") }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 bg-gray-50/80 text-sm transition ${
                    confirm && confirm !== password ? "border-red-300" : "border-gray-200 focus:border-[#4b2e2e]"
                  }`}
                  required
                  autoComplete="new-password"
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm text-center">{error}</div>
              )}

              <button type="submit" disabled={submitting || !password || !confirm}
                className="w-full bg-[#4b2e2e] text-white py-3 rounded-full hover:bg-[#3a2323] transition font-semibold text-sm shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60">
                {submitting ? "Updating..." : "Update Password"}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  )
}
