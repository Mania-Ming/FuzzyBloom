"use client"

import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-up">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <img src="/logo.jpg" alt="logo" className="w-16 h-16 rounded-full object-cover ring-4 ring-[#4b2e2e]/10 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">Enter your email and we'll send you a reset link.</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-3xl">📧</div>
              <p className="font-semibold text-gray-800">Check your inbox!</p>
              <p className="text-sm text-gray-500">
                We sent a reset link to <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <Link href="/login" className="inline-block mt-2 text-[#4b2e2e] text-sm font-semibold hover:underline">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <button
                type="submit"
                className="w-full bg-[#4b2e2e] text-white py-3 rounded-full hover:bg-[#3a2323] transition font-semibold text-sm shadow-md shadow-[#4b2e2e]/20"
              >
                Send Reset Link
              </button>
              <Link href="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700 transition">
                ← Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
