"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Toast, { ToastType } from "@/components/admin/Toast"

type Settings = {
  shop_name: string
  footer_text: string
  logo_url: string
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({ shop_name: "Fuzzy Bloom", footer_text: "© 2026 Fuzzy Bloom Handicrafts by Kate. All rights reserved.", logo_url: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<ToastType>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("settings").select("*").eq("id", 1).single()
      if (data) setForm({ shop_name: data.shop_name ?? "Fuzzy Bloom", footer_text: data.footer_text ?? "", logo_url: data.logo_url ?? "" })
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from("settings").upsert({ id: 1, ...form })
    if (error) setToast({ message: "Failed to save settings.", type: "error" })
    else setToast({ message: "Settings saved!", type: "success" })
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-xl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-bold text-[#2a1515]">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your shop configuration</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-8 space-y-5">

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Shop Name</label>
          <input value={form.shop_name} onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 transition" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Footer Text</label>
          <textarea value={form.footer_text} onChange={e => setForm(p => ({ ...p, footer_text: e.target.value }))} rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 transition resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Logo URL (optional)</label>
          <input value={form.logo_url} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} placeholder="https://..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 transition" />
          {form.logo_url && (
            <img src={form.logo_url} alt="logo preview" className="mt-3 w-16 h-16 rounded-full object-cover border border-gray-200" />
          )}
        </div>

        <div className="pt-2 border-t border-gray-50">
          <button type="submit" disabled={saving}
            className="bg-[#4b2e2e] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  )
}
