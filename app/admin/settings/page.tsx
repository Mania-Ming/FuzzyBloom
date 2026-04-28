"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User, Mail, Lock, Save, Eye, EyeOff, MapPin } from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 focus:border-[#4b2e2e] transition"

function PasswordField({
  label, value, show, onChange, onToggle, placeholder,
}: {
  label: string
  value: string
  show: boolean
  onChange: (v: string) => void
  onToggle: () => void
  placeholder: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls + " pr-11"}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pickupLocation, setPickupLocation] = useState("")
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
      // Use API route — bypasses RLS
      const res = await fetch("/api/admin/settings?key=pickup_location")
      const rows: { key: string; value: string }[] = await res.json()
      setPickupLocation(rows[0]?.value ?? "")
      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error: profileErr } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", user.id)
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
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email!, password: currentPassword })
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
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "pickup_location", value: pickupLocation }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to save")
      setToast({ message: "Pickup location saved!", type: "success" })
    } catch (err: any) {
      setToast({ message: err.message, type: "error" })
    }
    setSavingLocation(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex items-center gap-2">
        <User size={22} className="text-[#4b2e2e]" />
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your profile and store settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT — Admin Profile (col-span-2) */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-2 bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-6 space-y-4">
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
            <input value={email} disabled className={inputCls + " opacity-50 cursor-not-allowed"} />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={11} /> Change Password
            </p>
            <PasswordField
              label="Current Password"
              value={currentPassword}
              show={showCurrent}
              onChange={setCurrentPassword}
              onToggle={() => setShowCurrent(p => !p)}
              placeholder="Enter current password"
            />
            <PasswordField
              label="New Password"
              value={newPassword}
              show={showNew}
              onChange={setNewPassword}
              onToggle={() => setShowNew(p => !p)}
              placeholder="Enter new password"
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              show={showConfirm}
              onChange={setConfirmPassword}
              onToggle={() => setShowConfirm(p => !p)}
              placeholder="Confirm new password"
            />
            <p className="text-xs text-gray-400">Leave blank to keep current password.</p>
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#4b2e2e] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#3a2323] transition disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {/* RIGHT — Store Settings (col-span-1) */}
        <form onSubmit={handleSaveLocation} className="lg:col-span-1 bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-6 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Settings</p>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <MapPin size={12} /> Pickup Location
            </label>
            <input
              value={pickupLocation}
              onChange={e => setPickupLocation(e.target.value)}
              placeholder="e.g. 123 Rizal St, Manila"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Shown to customers who choose Pick-up at checkout.</p>
          </div>

          <button
            type="submit"
            disabled={savingLocation}
            className="w-full flex items-center justify-center gap-2 bg-[#4b2e2e] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#3a2323] transition disabled:opacity-60"
          >
            <Save size={15} />
            {savingLocation ? "Saving..." : "Save Location"}
          </button>
        </form>

      </div>
    </div>
  )
}
