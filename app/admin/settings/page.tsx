"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Toast, { ToastType } from "@/components/admin/Toast"
import { Settings, Store, Mail, Phone, Link, Image as ImageIcon } from "lucide-react"

type SettingsForm = {
  shop_name: string
  footer_text: string
  logo_url: string
  contact_email: string
  contact_number: string
  facebook_url: string
  instagram_url: string
}

const defaults: SettingsForm = {
  shop_name: "Fuzzy Bloom",
  footer_text: "© 2026 Fuzzy Bloom Handicrafts by Kate. All rights reserved.",
  logo_url: "",
  contact_email: "fuzzybloom@gmail.com",
  contact_number: "",
  facebook_url: "",
  instagram_url: "",
}

const Field = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {icon} {label}
    </label>
    {children}
  </div>
)

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 focus:border-[#4b2e2e] transition"

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<ToastType>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("settings").select("*").maybeSingle()
      if (error) console.error("Settings fetch error:", error.message)
      if (data) {
        setForm({
          shop_name: data.shop_name ?? defaults.shop_name,
          footer_text: data.footer_text ?? defaults.footer_text,
          logo_url: data.logo_url ?? "",
          contact_email: data.contact_email ?? defaults.contact_email,
          contact_number: data.contact_number ?? "",
          facebook_url: data.facebook_url ?? "",
          instagram_url: data.instagram_url ?? "",
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function set(key: keyof SettingsForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, ...form }, { onConflict: "id" })
    if (error) {
      console.error("Settings save error:", error.message)
      setToast({ message: "Failed to save settings.", type: "error" })
    } else {
      setToast({ message: "Settings saved successfully!", type: "success" })
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex items-center gap-2">
        <Settings size={22} className="text-[#4b2e2e]" />
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your shop configuration</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* SHOP INFO */}
        <div className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-6 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Store size={13} /> Shop Info</p>

          <Field label="Shop Name" icon={<Store size={12} />}>
            <input value={form.shop_name} onChange={set("shop_name")} className={inputCls} />
          </Field>

          <Field label="Logo URL" icon={<ImageIcon size={12} />}>
            <input value={form.logo_url} onChange={set("logo_url")} placeholder="https://..." className={inputCls} />
            {form.logo_url && (
              <img src={form.logo_url} alt="logo preview" className="mt-2 w-14 h-14 rounded-full object-cover border border-gray-200" />
            )}
          </Field>

          <Field label="Footer Text" icon={<Store size={12} />}>
            <textarea value={form.footer_text} onChange={set("footer_text")} rows={2}
              className={inputCls + " resize-none"} />
          </Field>
        </div>

        {/* CONTACT */}
        <div className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-6 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Mail size={13} /> Contact</p>

          <Field label="Contact Email" icon={<Mail size={12} />}>
            <input type="email" value={form.contact_email} onChange={set("contact_email")} placeholder="shop@email.com" className={inputCls} />
          </Field>

          <Field label="Contact Number" icon={<Phone size={12} />}>
            <input type="tel" value={form.contact_number} onChange={set("contact_number")} placeholder="09XXXXXXXXX" className={inputCls} />
          </Field>
        </div>

        {/* SOCIAL LINKS */}
        <div className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-6 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Link size={13} /> Social Links</p>

          <Field label="Facebook URL" icon={<Link size={12} />}>
            <input value={form.facebook_url} onChange={set("facebook_url")} placeholder="https://facebook.com/yourpage" className={inputCls} />
          </Field>

          <Field label="Instagram URL" icon={<Link size={12} />}>
            <input value={form.instagram_url} onChange={set("instagram_url")} placeholder="https://instagram.com/yourhandle" className={inputCls} />
          </Field>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-[#4b2e2e] text-white py-3.5 rounded-full text-sm font-semibold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  )
}
