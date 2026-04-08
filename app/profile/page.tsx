"use client"

import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useMe } from "@/lib/hooks/useMe"
import { useLogout } from "@/lib/hooks/useLogout"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function ProfilePage() {
  const { data: user, isLoading } = useMe()
  const { mutate: logout } = useLogout()
  const router = useRouter()

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.push("/"),
      onError: () => router.push("/"),
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-gray-800">
        <Navbar />

        <div className="max-w-lg mx-auto px-6 py-14">
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden fade-up">

            {/* BANNER */}
            <div className="h-28 bg-gradient-to-r from-[#4b2e2e] via-[#7a4a4a] to-[#c084a0]" />

            <div className="px-8 pb-8">

              {/* AVATAR */}
              <div className="-mt-12 mb-5">
                {user?.profile_image ? (
                  <Image
                    src={user.profile_image}
                    alt="profile"
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
                    {initials}
                  </div>
                )}
              </div>

              {/* NAME & EMAIL */}
              {isLoading ? (
                <div className="space-y-2 mb-6">
                  <div className="h-6 w-40 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-4 w-56 bg-gray-50 rounded-lg animate-pulse" />
                </div>
              ) : (
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900">{user?.full_name}</h1>
                  <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
                </div>
              )}

              {/* DETAILS */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: "👤", label: "Full Name", value: user?.full_name },
                  { icon: "✉️", label: "Email", value: user?.email },
                  { icon: "🆔", label: "User ID", value: user?.id },
                ].map((field) => (
                  <div key={field.label} className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-2xl">
                    <span className="text-lg shrink-0">{field.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{field.label}</p>
                      <p className="font-medium text-gray-800 text-sm truncate">{field.value ?? "—"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard"
                  className="flex-1 text-center py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  ← Back to Shop
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-full bg-[#4b2e2e] text-white text-sm font-semibold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
