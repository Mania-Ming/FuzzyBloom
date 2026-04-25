"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User, Mail, Lock, Save, MapPin } from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 focus:border-[#4b2e2e] transition"

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pickupLocation, setPickupLocation] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
      setName(profile?.full_name ?? "")
      setEmail(user.email ?? "")

      const { data: settings } = await supabase.from("settings").select("*").eq("key", "pickup_location").single()
      setPickupLocation(settings?.value ?? "")
      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() })
      .eq("id", user.id)

    if (profileErr) {
      setToast({ message: "Failed to update profile: " + profileErr.message, type: "error" })
      setSaving(false)
      return
    }

    if (newPassword.trim()) {
      if (newPassword !== confirmPassword) {
        setToast({ message: "New passwords do not match.", type: "error" })
        setSaving(false)
        return
      }
      if (newPassword.length < 6) {
        setToast({ message: "Password must be at least 6 characters.", type: "error" })
        setSaving(false)
        return
      }
      // Re-authenticate with current password first
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })
      if (signInErr) {
        setToast({ message: "Current password is incorrect.", type: "error" })
        setSaving(false)
        return
      }
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword })
      if (pwErr) {
        setToast({ message: "Password update failed: " + pwErr.message, type: "error" })
        setSaving(false)
        return
      }
    }

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setToast({ message: "Profile updated successfully!", type: "success" })
    setSaving(false)
  }

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault()
    setSavingLocation(true)
    try {
      const { error } = await supabase
        .from("settings")
        .upsert(
          { key: "pickup_location", value: pickupLocation },
          { onConflict: "key" }
        )
      if (error) throw error
      setToast({ message: "Settings saved!", type: "success" })
    } catch (err: any) {
      console.error(err.message)
      setToast({ message: err.message, type: "error" })
    }
    setSavingLocation(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-lg">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex items-center gap-2">
        <User size={22} className="text-[#4b2e2e]" />
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your profile and store settings</p>
        </div>
      </div>

      {/* PROFILE FORM */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-6 space-y-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Profile</p>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <User size={12} /> Full Name
          </label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputCls} />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <Mail size={12} /> Email
          </label>
          <input value={email} disabled className={inputCls + " opacity-60 cursor-not-allowed"} />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock size={11} /> Change Password
          </p>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={inputCls + " pr-10"}
              />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base leading-none">
                {showCurrentPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={inputCls + " pr-10"}
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base leading-none">
                {showNewPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={inputCls + " pr-10"}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base leading-none">
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">Leave password fields blank to keep current password.</p>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full flex items-center justify-center gap-2 bg-[#4b2e2e] text-white py-3.5 rounded-full text-sm font-semibold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {/* PICKUP LOCATION FORM */}
      <form onSubmit={handleSaveLocation} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-6 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Settings</p>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <MapPin size={12} /> Pickup Location
          </label>
          <input
            value={pickupLocation}
            onChange={e => setPickupLocation(e.target.value)}
            placeholder="e.g. 123 Rizal St, Brgy. San Jose, Manila"
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">Shown to customers who choose Pick-up at checkout.</p>
        </div>
        <button
          type="submit"
          disabled={savingLocation}
          className="w-full flex items-center justify-center gap-2 bg-[#4b2e2e] text-white py-3.5 rounded-full text-sm font-semibold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60"
        >
          <Save size={15} />
          {savingLocation ? "Saving..." : "Save Location"}
        </button>
      </form>
    </div>
  )
}
