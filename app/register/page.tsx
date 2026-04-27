"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Auto-redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard")
    })
  }, [router])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email || !password) return
    if (password.length < 6) { setErrorMsg("Password must be at least 6 characters."); return }

    setIsPending(true)
    setErrorMsg("")
    setSuccessMsg("")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        setErrorMsg("This email is already registered. Try logging in.")
      } else if (error.message.includes("weak")) {
        setErrorMsg("Password is too weak. Use at least 6 characters.")
      } else {
        setErrorMsg(error.message || "Registration failed. Please try again.")
      }
      setIsPending(false)
      return
    }

    if (!data.user) {
      setErrorMsg("Registration failed. Please try again.")
      setIsPending(false)
      return
    }

    // Send OTP first, THEN sign out
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name: fullName, user_id: data.user.id }),
    })

    // Sign out after OTP is sent so user must verify before logging in
    await supabase.auth.signOut()

    if (!res.ok) {
      const json = await res.json()
      setErrorMsg(json.error || "Failed to send verification email.")
      setIsPending(false)
      return
    }

    sessionStorage.setItem("verify_email", email)
    sessionStorage.setItem("verify_name", fullName)
    sessionStorage.setItem("verify_user_id", data.user.id)

    router.push("/verify")
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <img src="/logo.jpg" alt="logo" className="w-16 h-16 rounded-full object-cover ring-4 ring-[#4b2e2e]/10 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the Fuzzy Bloom community</p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
            <Link href="/login" className="flex-1 text-center py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition">Login</Link>
            <span className="flex-1 text-center py-2 rounded-lg bg-white shadow-sm text-sm font-semibold text-[#4b2e2e]">Register</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer w-5 h-5 flex items-center justify-center"
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                </button>
              </div>
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
              className="w-full bg-[#4b2e2e] text-white py-3 rounded-full hover:bg-[#3a2323] transition font-semibold text-sm shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60 mt-1"
            >
              {isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4b2e2e] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
