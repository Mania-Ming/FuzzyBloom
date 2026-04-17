"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()

  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [address, setAddress] = useState("")
  const [contactNumber, setContactNumber] = useState("")

  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    async function loadProfile() {
      // Step 1: get the logged-in user directly from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("Auth error:", authError?.message)
        router.replace("/login")
        return
      }

      setUserId(user.id)
      setEmail(user.email ?? "")

      // Step 2: fetch profile row using the auth user's id
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, address, contact_number")
        .eq("id", user.id)
        .single()

      console.log("Profile fetch result:", { data, error })

      if (error) {
        console.error("Profile fetch error:", error.message)
        // If no row exists yet, create one
        if (error.code === "PGRST116") {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name ?? "",
          })
          setFullName(user.user_metadata?.full_name ?? "")
        }
      } else if (data) {
        setFullName(data.full_name ?? "")
        setAddress(data.address ?? "")
        setContactNumber(data.contact_number ?? "")
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    setErrorMsg("")
    setSuccessMsg("")

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        address: address,
        contact_number: contactNumber,
      })
      .eq("id", userId)

    if (error) {
      console.error("Profile update error:", error.message)
      setErrorMsg("Failed to save: " + error.message)
      setSaving(false)
      return
    }

    setSuccessMsg("Profile updated successfully!")
    setEditMode(false)
    setSaving(false)
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.setItem("isLoggedIn", "false")
    window.location.replace("/")
  }

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "?"

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg">
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">

              {/* BANNER */}
              <div className="h-28 bg-gradient-to-r from-[#4b2e2e] via-[#7a4a4a] to-[#c084a0]" />

              <div className="px-8 pb-8">

                {/* AVATAR + EDIT BUTTON */}
                <div className="-mt-12 mb-5 flex items-end justify-between">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
                    {initials}
                  </div>
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
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900">{fullName || email}</h1>
                  <p className="text-gray-400 text-sm mt-0.5">{email}</p>
                </div>

                {/* MESSAGES */}
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
                      { icon: "👤", label: "Full Name", value: fullName },
                      { icon: "✉️", label: "Email", value: email },
                      { icon: "📍", label: "Address", value: address },
                      { icon: "📞", label: "Contact Number", value: contactNumber },
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
                    {[
                      { label: "Full Name", value: fullName, setter: setFullName, type: "text", placeholder: "Your full name" },
                      { label: "Address", value: address, setter: setAddress, type: "text", placeholder: "Your delivery address" },
                      { label: "Contact Number", value: contactNumber, setter: setContactNumber, type: "tel", placeholder: "e.g. 09123456789" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{field.label}</label>
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/30 focus:border-[#4b2e2e] bg-gray-50/80 text-sm transition"
                        />
                      </div>
                    ))}
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
