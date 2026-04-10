"use client"

import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useMe } from "@/lib/hooks/useMe"
import { useLogout } from "@/lib/hooks/useLogout"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const { data: user, isLoading } = useMe()
  const { mutate: logout } = useLogout()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [fullName, setFullName] = useState("")
  const [address, setAddress] = useState("")
  const [contactNumber, setContactNumber] = useState("")

  // load existing profile data into fields
  useEffect(() => {
    if (user) {
      setFullName((user as any).full_name ?? "")
      setAddress((user as any).address ?? "")
      setContactNumber((user as any).contact_number ?? "")
    }
  }, [user])

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.push("/"),
      onError: () => router.push("/"),
    })
  }

  async function handleSave() {
    if (!user?.id) return
    setSaving(true)
    setErrorMsg("")
    setSuccessMsg("")

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, address, contact_number: contactNumber })
      .eq("id", user.id)

    if (error) {
      setErrorMsg("Failed to save. Please try again.")
      setSaving(false)
      return
    }

    // update cached query data
    queryClient.setQueryData(["me"], (old: any) => ({
      ...old,
      full_name: fullName,
      address,
      contact_number: contactNumber,
    }))

    setSuccessMsg("Profile updated successfully!")
    setEditMode(false)
    setSaving(false)
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden flex flex-col text-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 py-4 overflow-hidden">
          <div className="w-full max-w-lg">
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">

            {/* BANNER */}
            <div className="h-28 bg-gradient-to-r from-[#4b2e2e] via-[#7a4a4a] to-[#c084a0]" />

            <div className="px-8 pb-8">

              {/* AVATAR + EDIT BUTTON */}
              <div className="-mt-12 mb-5 flex items-end justify-between">
                {user?.profile_image ? (
                  <Image src={user.profile_image} alt="profile" width={80} height={80} className="rounded-full object-cover border-4 border-white shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
                    {initials}
                  </div>
                )}
                {!editMode && (
                  <button
                    onClick={() => { setEditMode(true); setSuccessMsg(""); setErrorMsg("") }}
                    className="text-xs font-semibold text-[#4b2e2e] border border-[#4b2e2e]/30 px-4 py-2 rounded-full hover:bg-[#4b2e2e]/5 transition"
                  >
                    ✏️ Edit Profile
                  </button>
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

              {/* SUCCESS / ERROR */}
              {successMsg && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-green-600 text-sm text-center mb-4">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-500 text-sm text-center mb-4">
                  {errorMsg}
                </div>
              )}

              {/* VIEW MODE */}
              {!editMode && (
                <div className="space-y-3 mb-6">
                  {[
                    { icon: "👤", label: "Full Name", value: user?.full_name },
                    { icon: "✉️", label: "Email", value: user?.email },
                    { icon: "📍", label: "Address", value: (user as any)?.address },
                    { icon: "📞", label: "Contact Number", value: (user as any)?.contact_number },
                  ].map((field) => (
                    <div key={field.label} className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-2xl">
                      <span className="text-lg shrink-0">{field.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{field.label}</p>
                        <p className="font-medium text-gray-800 text-sm truncate">{field.value || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* EDIT MODE */}
              {editMode && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your delivery address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Contact Number</label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. 09123456789"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => { setEditMode(false); setErrorMsg("") }}
                      className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-3 rounded-full bg-[#4b2e2e] text-white text-sm font-semibold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              {!editMode && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard" className="flex-1 text-center py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                    ← Back to Shop
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-full bg-[#4b2e2e] text-white text-sm font-semibold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
