"use client"

import { useMe } from "@/lib/hooks/useMe"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError, isFetching } = useMe()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isFetching && isError) {
      router.replace("/login")
    }
  }, [isLoading, isFetching, isError, router])

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
