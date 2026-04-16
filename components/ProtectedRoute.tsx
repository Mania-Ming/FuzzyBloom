"use client"

import { useEffect, useState } from "react"
import { getUserRole } from "@/lib/getUserRole"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const role = await getUserRole()

      if (!role) {
        localStorage.setItem("isLoggedIn", "false")
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
