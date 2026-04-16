"use client"

import { useEffect, useState } from "react"
import { getUserRole } from "@/lib/getUserRole"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const role = await getUserRole()

      if (!role) {
        window.location.href = "/login"
        return
      }

      if (role !== "admin") {
        window.location.href = "/dashboard"
        return
      }

      setChecking(false)
    }
    check()
  }, [])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf6f0]">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return <>{children}</>
}
