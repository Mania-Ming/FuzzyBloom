"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.user) {
      setError("Invalid email or password.")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profile?.role !== "admin") {
      await supabase.auth.signOut()
      setError("Access denied. Admin accounts only.")
      setLoading(false)
      return
    }

    router.push("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundImage: "url('/bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md fade-up">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.jpg" alt="logo" width={60} height={60} className="rounded-full object-cover ring-4 ring-[#4b2e2e]/10 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-400 text-sm mt-1">Fuzzy Bloom Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@fuzzybloom.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] transition" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm text-center">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#4b2e2e] text-white py-3 rounded-full font-semibold text-sm hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60 mt-1">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
