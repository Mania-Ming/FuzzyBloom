"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getUserRole } from "@/lib/getUserRole"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        localStorage.setItem("isLoggedIn", "false")
        window.location.href = "/login"
        return
      }

      const role = await getUserRole(user.id)

      if (!role) {
        window.location.href = "/login"
        return
      }

      if (role === "admin") {
        window.location.href = "/admin"
        return
      }

      setChecking(false)
    }
    check()
  }, [])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return <>{children}</>
}
