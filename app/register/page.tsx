"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useRegister } from "@/lib/hooks/useRegister"

export default function RegisterPage() {
  const router = useRouter()
  const { mutate: register, isPending, isError, error } = useRegister()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    register({ full_name: fullName, email, password }, { onSuccess: () => router.push("/login") })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-up">

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <img src="/logo.jpg" alt="logo" className="w-16 h-16 rounded-full object-cover ring-4 ring-[#4b2e2e]/10 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the Fuzzy Bloom community</p>
          </div>

          {/* TABS */}
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
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                required
              />
            </div>

            {isError && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm text-center">
                {(() => {
                  const data = (error as any)?.response?.data
                  if (!data) return "Registration failed. Please try again."
                  if (typeof data === "string") return data
                  if (data.detail) return data.detail
                  const firstKey = Object.keys(data)[0]
                  const msg = data[firstKey]
                  return `${firstKey}: ${Array.isArray(msg) ? msg[0] : msg}`
                })()}
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
