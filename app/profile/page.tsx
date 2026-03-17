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
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.push("/"),
      onError: () => router.push("/"),
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-black">

        <Navbar />

        <div className="max-w-2xl mx-auto px-6 py-16">

          {/* PROFILE CARD */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">

            {/* BANNER */}
            <div className="h-32 bg-gradient-to-r from-[#4b2e2e] to-[#c084a0]" />

            {/* AVATAR + INFO */}
            <div className="px-8 pb-8">

              {/* AVATAR */}
              <div className="flex items-end justify-between -mt-12 mb-6">
                {user?.profile_image ? (
                  <Image
                    src={user.profile_image}
                    alt="profile"
                    width={88}
                    height={88}
                    className="rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-[88px] h-[88px] rounded-full bg-[#4b2e2e] text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md">
                    {initials}
                  </div>
                )}
              </div>

              {/* NAME & EMAIL */}
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {user?.full_name}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {user?.email}
                  </p>
                </>
              )}

              {/* DIVIDER */}
              <div className="border-t border-gray-100 my-6" />

              {/* DETAILS */}
              <div className="space-y-4">

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Full Name</p>
                    <p className="font-medium text-gray-800">{user?.full_name ?? "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="text-xl">✉️</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                    <p className="font-medium text-gray-800">{user?.email ?? "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="text-xl">🆔</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">User ID</p>
                    <p className="font-medium text-gray-800">{user?.id ?? "—"}</p>
                  </div>
                </div>

              </div>

              {/* DIVIDER */}
              <div className="border-t border-gray-100 my-6" />

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-3">

                <Link
                  href="/dashboard"
                  className="flex-1 text-center py-3 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                >
                  ← Back to Shop
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-full bg-[#4b2e2e] text-white text-sm font-medium hover:bg-[#3a2323] transition"
                >
                  🚪 Logout
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </ProtectedRoute>
  )
}
