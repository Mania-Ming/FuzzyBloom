"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"

const statusColors: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-600 border-amber-100",
  Processing: "bg-blue-50 text-blue-600 border-blue-100",
  Shipped: "bg-purple-50 text-purple-600 border-purple-100",
  Delivered: "bg-green-50 text-green-600 border-green-100",
  Cancelled: "bg-red-50 text-red-500 border-red-100",
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

                {/* ORDER HEADER */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-50 flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Order #{order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.created_at ? new Date(order.created_at).toLocaleDateString() : order.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[order.status] ?? statusColors.Pending}`}>
                      {order.status || "Pending"}
                    </span>
                    <span className="text-xs text-gray-400 uppercase font-medium">{order.payment}</span>
                  </div>
                </div>

                {/* ORDER ITEMS */}
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

                {/* ORDER FOOTER */}
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
