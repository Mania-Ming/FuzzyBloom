"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Legacy redirect — Supabase now points to /update-password
export default function ResetPasswordRedirect() {
  const router = useRouter()
  useEffect(() => {
    // Preserve the hash/query so the token is not lost
    router.replace("/update-password" + window.location.search + window.location.hash)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
