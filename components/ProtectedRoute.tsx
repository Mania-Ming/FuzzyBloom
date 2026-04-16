"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserRole } from "@/lib/getUserRole"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const role = await getUserRole()

      if (!role) {
        // Not logged in
        localStorage.setItem("isLoggedIn", "false")
        router.replace("/login")
        return
      }

      if (role === "admin") {
        // Admin should not be on user pages
        router.replace("/admin")
        return
      }

      setChecking(false)
    }
    check()
  }, [router])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return <>{children}</>
}
