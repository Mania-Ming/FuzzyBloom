"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"

const STATUS_STEPS = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"]

const statusBadge: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-500 border-gray-200",
  Confirmed: "bg-blue-50 text-blue-600 border-blue-100",
  Preparing: "bg-orange-50 text-orange-500 border-orange-100",
  "Out for Delivery": "bg-purple-50 text-purple-600 border-purple-100",
  Delivered: "bg-green-50 text-green-600 border-green-100",
  Cancelled: "bg-red-50 text-red-500 border-red-100",
}

function StatusTimeline({ status }: { status: string }) {
  if (status === "Cancelled") {
    return (
      <div className="px-5 py-3 border-t border-gray-50">
        <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-3 py-1 rounded-full">Order Cancelled</span>
      </div>
    )
  }
  const currentIdx = STATUS_STEPS.indexOf(status)
  return (
    <div className="px-5 py-4 border-t border-gray-50">
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentIdx
          const isLast = i === STATUS_STEPS.length - 1
          return (
            <div key={step} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all ${done ? "bg-[#4b2e2e] border-[#4b2e2e] text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] mt-1 text-center leading-tight max-w-[48px] ${done ? "text-[#4b2e2e] font-semibold" : "text-gray-300"}`}>{step}</span>
              </div>
              {!isLast && <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < currentIdx ? "bg-[#4b2e2e]" : "bg-gray-100"}`} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { data: user } = useMe()
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data || []))
  }, [user?.id])

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <main className="max-w-4xl mx-auto w-full px-6 md:px-12 py-10 flex-1">

          <div className="mb-8">
            <h1 className="text-3xl text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>Order History</h1>
            <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-24 text-gray-400 bg-white/60 rounded-3xl border border-white/60">
              <p className="text-5xl mb-4">📦</p>
              <p className="font-medium text-gray-500">No orders yet</p>
              <Link href="/dashboard" className="text-[#4b2e2e] text-sm font-semibold mt-3 inline-block hover:underline">Start Shopping →</Link>
            </div>
          )}

          <div className="space-y-5">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/80 rounded-2xl border border-white/60 shadow-sm overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-50 flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Order #{String(order.id).slice(0, 8)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadge[order.status] ?? statusBadge.Pending}`}>
                      {order.status || "Pending"}
                    </span>
                    <span className="text-xs text-gray-400 uppercase font-medium">{order.payment}</span>
                  </div>
                </div>

                {/* DELIVERY SCHEDULE */}
                {(order.delivery_date || order.delivery_time) && (
                  <div className="px-5 py-3 bg-amber-50/40 border-b border-amber-50 flex items-center gap-4 text-xs text-amber-700 flex-wrap">
                    {order.delivery_date && <span>📅 {new Date(order.delivery_date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>}
                    {order.delivery_time && <span>🕐 {order.delivery_time}</span>}
                    {order.recipient_message && <span className="text-gray-500 italic">💬 "{order.recipient_message}"</span>}
                  </div>
                )}

                {/* ITEMS */}
                <div className="px-5 py-4 space-y-3">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                          <Image src={item.img || "/logo.jpg"} alt={item.name} width={44} height={44} className="rounded-lg object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="font-bold text-[#4b2e2e] text-sm shrink-0">₱{Number(item.price) || 0}</p>
                    </div>
                  ))}
                </div>

                {/* STATUS TIMELINE */}
                <StatusTimeline status={order.status || "Pending"} />

                {/* FOOTER */}
                <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50 flex justify-end">
                  <p className="text-sm font-bold text-gray-700">
                    Total: <span className="text-[#4b2e2e]">₱{Number(order.total) || 0}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
