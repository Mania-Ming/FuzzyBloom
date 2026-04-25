"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Bike, Phone, Plus, Trash2, User } from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"

type Rider = { id: string; name: string; phone: string; created_at: string }

const inputCls = "flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4b2e2e] transition bg-white"

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [adding, setAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastType>(null)

  const fetchRiders = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from("riders").select("*").order("created_at", { ascending: false })
    setRiders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRiders() }, [fetchRiders])

  async function addRider() {
    if (!name.trim() || !phone.trim()) {
      setToast({ message: "Please fill in both name and phone.", type: "error" })
      return
    }
    if (!/^09\d{9}$/.test(phone.trim())) {
      setToast({ message: "Enter a valid 11-digit PH number (09XXXXXXXXX).", type: "error" })
      return
    }
    setAdding(true)
    const { error } = await supabase.from("riders").insert({ name: name.trim(), phone: phone.trim() })
    if (error) {
      setToast({ message: "Failed to add rider: " + error.message, type: "error" })
    } else {
      setName("")
      setPhone("")
      setToast({ message: "Rider added successfully!", type: "success" })
      fetchRiders()
    }
    setAdding(false)
  }

  async function deleteRider() {
    if (!deleteId) return
    const { error } = await supabase.from("riders").delete().eq("id", deleteId)
    setDeleteId(null)
    if (error) {
      setToast({ message: "Failed to delete rider: " + error.message, type: "error" })
    } else {
      setToast({ message: "Rider removed.", type: "success" })
      fetchRiders()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {deleteId && (
        <ConfirmModal
          message="Remove this rider? This cannot be undone."
          onConfirm={deleteRider}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <div className="flex items-center gap-2">
        <Bike size={22} className="text-[#4b2e2e]" />
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Riders</h1>
          <p className="text-gray-400 text-sm">{riders.length} registered rider{riders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* ADD RIDER */}
      <div className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Add New Rider</p>
        <div className="flex gap-2 flex-wrap">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Rider Name"
            className={inputCls}
          />
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="09XXXXXXXXX"
            maxLength={11}
            className={inputCls}
          />
          <button
            onClick={addRider}
            disabled={adding}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4b2e2e] text-white rounded-xl text-sm font-semibold hover:bg-[#3a2323] transition disabled:opacity-60"
          >
            <Plus size={15} />
            {adding ? "Adding..." : "Add Rider"}
          </button>
        </div>
      </div>

      {/* RIDERS LIST */}
      <div className="space-y-2">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && riders.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#e8d5d5] py-14 text-center">
            <Bike size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No riders yet</p>
            <p className="text-gray-300 text-sm mt-1">Add your first rider above</p>
          </div>
        )}

        {riders.map(rider => (
          <div key={rider.id} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                <User size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{rider.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Phone size={10} /> {rider.phone}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeleteId(rider.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
