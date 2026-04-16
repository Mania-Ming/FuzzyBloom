"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getUserRole } from "@/lib/getUserRole"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        window.location.href = "/login"
        return
      }

      const role = await getUserRole(data.user.id)

      if (role === "admin") {
        setAllowed(true)
        setLoading(false)
      } else {
        window.location.href = "/dashboard"
        // don't setLoading(false) — keep spinner while redirecting
      }
    }

    checkAdmin()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fdf6f0]">
        <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}
