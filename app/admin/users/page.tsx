"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { Users, Search, ShieldCheck, ShieldOff, CheckCircle2, Clock } from "lucide-react"

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  is_verified: boolean
  created_at: string
}

function Avatar({ name }: { name: string }) {
  const initials = (name ?? "?")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
      {initials}
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers]               = useState<Profile[]>([])
  const [loading, setLoading]           = useState(true)
  const [toast, setToast]               = useState<ToastType>(null)
  const [promoteTarget, setPromoteTarget] = useState<Profile | null>(null)
  const [promoting, setPromoting]       = useState(false)
  const [search, setSearch]             = useState("")

  // ── Fetch via API route (service role — bypasses RLS) ──────────
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (!res.ok) throw new Error(await res.text())
      const data: Profile[] = await res.json()
      setUsers(data)
    } catch (err: any) {
      console.error("[users] load error:", err.message)
      setToast({ message: "Failed to load users: " + err.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Real-time: re-fetch whenever profiles table changes
    const channel = supabase
      .channel("admin-users-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  // ── Role toggle ────────────────────────────────────────────────
  async function handlePromote() {
    if (!promoteTarget) return
    setPromoting(true)
    const newRole = promoteTarget.role === "admin" ? "customer" : "admin"

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: promoteTarget.id, role: newRole }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setToast({
        message: `${promoteTarget.full_name} ${newRole === "admin" ? "promoted to Admin" : "demoted to Customer"}.`,
        type: "success",
      })
      load()
    } catch (err: any) {
      setToast({ message: "Failed to update role: " + err.message, type: "error" })
    } finally {
      setPromoting(false)
      setPromoteTarget(null)
    }
  }

  const filtered = users.filter(u =>
    (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const verifiedCount = users.filter(u => u.is_verified).length

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {promoteTarget && (
        <ConfirmModal
          message={`${promoteTarget.role === "admin" ? "Demote" : "Promote"} "${promoteTarget.full_name}" ${promoteTarget.role === "admin" ? "to Customer" : "to Admin"}?`}
          onConfirm={handlePromote}
          onCancel={() => setPromoteTarget(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4b2e2e]/10 flex items-center justify-center">
            <Users size={20} className="text-[#4b2e2e]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2a1515]">Users</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {loading ? "Loading..." : `${users.length} registered · ${verifiedCount} verified`}
            </p>
          </div>
        </div>

        {/* Stats pills */}
        {!loading && (
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold">
              <CheckCircle2 size={12} /> {verifiedCount} Verified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold">
              <Clock size={12} /> {users.length - verifiedCount} Pending
            </span>
          </div>
        )}
      </div>

      {/* ── Search ── */}
      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 focus:border-[#4b2e2e] transition"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3.5 text-left font-semibold">User</th>
                <th className="px-6 py-3.5 text-left font-semibold">Email</th>
                <th className="px-6 py-3.5 text-left font-semibold">Role</th>
                <th className="px-6 py-3.5 text-left font-semibold">Verified</th>
                <th className="px-6 py-3.5 text-left font-semibold">Joined</th>
                <th className="px-6 py-3.5 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

              {/* Loading skeleton */}
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded-full animate-pulse" style={{ width: j === 0 ? "140px" : j === 1 ? "180px" : "80px" }} />
                    </td>
                  ))}
                </tr>
              ))}

              {/* Empty state */}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium text-sm">
                      {search ? "No users match your search" : "No users found"}
                    </p>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">

                  {/* Avatar + Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name} />
                      <span className="font-semibold text-gray-800 leading-tight">
                        {user.full_name || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {user.email || "—"}
                  </td>

                  {/* Role badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      user.role === "admin"
                        ? "bg-[#4b2e2e]/8 text-[#4b2e2e] border-[#4b2e2e]/20"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                      {user.role === "admin"
                        ? <><ShieldCheck size={11} /> Admin</>
                        : <><ShieldOff size={11} /> Customer</>
                      }
                    </span>
                  </td>

                  {/* Verified badge */}
                  <td className="px-6 py-4">
                    {user.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                        <Clock size={11} /> Pending
                      </span>
                    )}
                  </td>

                  {/* Joined date */}
                  <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-PH", {
                          month: "short", day: "numeric", year: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setPromoteTarget(user)}
                      disabled={promoting}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition disabled:opacity-50 ${
                        user.role === "admin"
                          ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                          : "border-[#4b2e2e]/20 text-[#4b2e2e] hover:bg-[#4b2e2e]/5"
                      }`}
                    >
                      {user.role === "admin"
                        ? <><ShieldOff size={11} /> Demote</>
                        : <><ShieldCheck size={11} /> Promote</>
                      }
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
            <p className="text-xs text-gray-400">
              Showing {filtered.length} of {users.length} users
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
