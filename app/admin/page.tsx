"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Stats = {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalSales: number
}

const statCards = (s: Stats) => [
  { label: "Total Products", value: s.totalProducts, icon: "🌸", color: "bg-pink-50 border-pink-100", text: "text-pink-600" },
  { label: "Total Orders", value: s.totalOrders, icon: "📦", color: "bg-amber-50 border-amber-100", text: "text-amber-600" },
  { label: "Total Users", value: s.totalUsers, icon: "👤", color: "bg-purple-50 border-purple-100", text: "text-purple-600" },
  { label: "Total Sales", value: `₱${s.totalSales.toLocaleString()}`, icon: "💰", color: "bg-green-50 border-green-100", text: "text-green-600" },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalSales: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: products },
        { count: orders },
        { count: users },
        { data: salesData },
        { data: recent },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount"),
        supabase.from("orders").select("id, total_amount, status, payment_method, created_at, profiles(full_name)").order("created_at", { ascending: false }).limit(5),
      ])

      const totalSales = salesData?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) ?? 0
      setStats({ totalProducts: products ?? 0, totalOrders: orders ?? 0, totalUsers: users ?? 0, totalSales })
      setRecentOrders(recent ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const statusColor: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Approved: "bg-blue-50 text-blue-600 border-blue-100",
    Completed: "bg-green-50 text-green-600 border-green-100",
    Cancelled: "bg-red-50 text-red-500 border-red-100",
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2a1515]">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome back, Admin</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards(stats).map((card) => (
          <div key={card.label} className={`${card.color} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Payment</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No orders yet</td></tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">#{String(order.id).slice(0, 8)}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{order.profiles?.full_name ?? "—"}</td>
                  <td className="px-6 py-4 font-bold text-[#4b2e2e]">₱{Number(order.total_amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500 uppercase text-xs">{order.payment_method}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor[order.status] ?? statusColor.Pending}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
