"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  is_verified: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType>(null)
  const [promoteTarget, setPromoteTarget] = useState<Profile | null>(null)
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, email, role, is_verified, created_at").order("created_at", { ascending: false })
    setUsers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handlePromote() {
    if (!promoteTarget) return
    const newRole = promoteTarget.role === "admin" ? "customer" : "admin"
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", promoteTarget.id)
    if (error) setToast({ message: "Failed to update role.", type: "error" })
    else { setToast({ message: `User ${newRole === "admin" ? "promoted to Admin" : "demoted to Customer"}.`, type: "success" }); load() }
    setPromoteTarget(null)
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {promoteTarget && (
        <ConfirmModal
          message={`${promoteTarget.role === "admin" ? "Demote" : "Promote"} "${promoteTarget.full_name}" ${promoteTarget.role === "admin" ? "to User" : "to Admin"}?`}
          onConfirm={handlePromote}
          onCancel={() => setPromoteTarget(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#2a1515]">Users</h1>
        <p className="text-gray-400 text-sm mt-0.5">{users.length} registered users · {users.filter(u => u.is_verified).length} verified</p>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
        className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 w-72" />

      <div className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Verified</th>
                <th className="px-6 py-3 text-left">Joined</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No users found</td></tr>}
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {user.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                      </div>
                      <p className="font-semibold text-gray-800">{user.full_name || "—"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      user.role === "admin"
                        ? "bg-[#4b2e2e]/10 text-[#4b2e2e] border-[#4b2e2e]/20"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                      {user.role === "admin" ? "Admin" : "Customer"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      user.is_verified
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-amber-50 text-amber-500 border-amber-100"
                    }`}>
                      {user.is_verified ? "✓ Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => setPromoteTarget(user)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        user.role === "admin"
                          ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                          : "border-[#4b2e2e]/20 text-[#4b2e2e] hover:bg-[#4b2e2e]/5"
                      }`}>
                      {user.role === "admin" ? "Demote to Customer" : "Promote to Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
