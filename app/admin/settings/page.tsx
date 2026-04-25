"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User, Mail, Lock, Save } from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 focus:border-[#4b2e2e] transition"

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
      setName(data?.full_name ?? "")
      setEmail(user.email ?? "")
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
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

    if (password.trim()) {
      const { error: pwErr } = await supabase.auth.updateUser({ password: password.trim() })
      if (pwErr) {
        setToast({ message: "Profile saved but password update failed: " + pwErr.message, type: "error" })
        setSaving(false)
        return
      }
    }

    setPassword("")
    setToast({ message: "Profile updated successfully!", type: "success" })
    setSaving(false)
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
          <h1 className="text-2xl font-bold text-[#2a1515]">Admin Profile</h1>
          <p className="text-gray-400 text-sm mt-0.5">Update your name and password</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-6 space-y-5">

        {/* Full Name */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <User size={12} /> Full Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className={inputCls}
          />
        </div>

        {/* Email — readonly */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <Mail size={12} /> Email
          </label>
          <input
            value={email}
            disabled
            className={inputCls + " opacity-60 cursor-not-allowed"}
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
        </div>

        {/* New Password */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <Lock size={12} /> New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className={inputCls}
          />
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
    </div>
  )
}
