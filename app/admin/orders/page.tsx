"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ShoppingBag, MapPin, Phone, ChevronDown, ChevronUp, Check, X } from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"

type Order = {
  id: string
  full_name: string
  total_amount: number
  payment_method: string
  status: string
  created_at: string
  address: string
  contact_number: string
}

type ActionConfirm = { orderId: string; action: "Approved" | "Completed" | "Cancelled" } | null

const statusColor: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-600 border-amber-100",
  Approved: "bg-blue-50 text-blue-600 border-blue-100",
  Completed: "bg-green-50 text-green-600 border-green-100",
  Cancelled: "bg-red-50 text-red-500 border-red-100",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType>(null)
  const [confirm, setConfirm] = useState<ActionConfirm>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({})
  const [filterStatus, setFilterStatus] = useState("All")

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("orders")
      .select("id, full_name, total_amount, payment_method, status, created_at, address, contact_number")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Orders fetch error:", error.message)
    } else {
      console.log("Orders loaded:", data?.length, data)
    }

    setOrders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function loadItems(orderId: string) {
    if (orderItems[orderId]) {
      setExpanded(expanded === orderId ? null : orderId)
      return
    }
    const { data, error } = await supabase
      .from("order_items")
      .select("quantity, price, products(name, image_url)")
      .eq("order_id", orderId)

    if (error) console.error("Order items error:", error.message)
    setOrderItems(prev => ({ ...prev, [orderId]: data ?? [] }))
    setExpanded(orderId)
  }

  async function handleAction() {
    if (!confirm) return
    const { orderId, action } = confirm
    setConfirm(null)

    const { error } = await supabase.from("orders").update({ status: action }).eq("id", orderId)
    if (error) { setToast({ message: "Failed to update order.", type: "error" }); return }

    if (action === "Approved") {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id")
        .eq("order_id", orderId)

      if (items && items.length > 0) {
        const productIds = items.map(i => i.product_id)
        await supabase.from("products").update({ is_available: false }).in("id", productIds)
      }
    }

    setToast({ message: `Order ${action.toLowerCase()} successfully.`, type: "success" })
    load()
  }

  const filtered = filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {confirm && (
        <ConfirmModal
          message={`Are you sure you want to mark this order as "${confirm.action}"?${confirm.action === "Approved" ? " This will mark related products as Sold Out." : ""}`}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex items-center gap-2">
        <ShoppingBag size={22} className="text-[#4b2e2e]" />
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Orders</h1>
          <p className="text-gray-400 text-sm">{orders.length} total orders</p>
        </div>
      </div>

      {/* STATUS FILTER */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Pending", "Approved", "Completed", "Cancelled"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition border ${filterStatus === s ? "bg-[#4b2e2e] text-white border-[#4b2e2e]" : "bg-white text-gray-500 border-gray-200 hover:border-[#4b2e2e] hover:text-[#4b2e2e]"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#e8d5d5] py-16 text-center">
            <ShoppingBag size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No orders found</p>
          </div>
        )}

        {filtered.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">

            {/* ORDER HEADER */}
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{order.full_name || "Unknown"}</p>
                  <p className="text-xs text-gray-400 font-mono">#{String(order.id).slice(0, 8)}</p>
                </div>
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p className="flex items-center gap-1"><MapPin size={11} /> {order.address || "—"}</p>
                  <p className="flex items-center gap-1"><Phone size={11} /> {order.contact_number || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-right">
                  <p className="font-bold text-[#4b2e2e]">₱{Number(order.total_amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 uppercase">{order.payment_method}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor[order.status] ?? statusColor.Pending}`}>
                  {order.status}
                </span>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="px-6 pb-4 flex items-center gap-2 flex-wrap border-t border-gray-50 pt-3">
              <button onClick={() => loadItems(order.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition">
                {expanded === order.id ? <><ChevronUp size={12} /> Hide Items</> : <><ChevronDown size={12} /> View Items</>}
              </button>

              {order.status === "Pending" && (
                <>
                  <button onClick={() => setConfirm({ orderId: order.id, action: "Approved" })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition">
                    <Check size={12} /> Approve
                  </button>
                  <button onClick={() => setConfirm({ orderId: order.id, action: "Cancelled" })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                    <X size={12} /> Cancel
                  </button>
                </>
              )}
              {order.status === "Approved" && (
                <button onClick={() => setConfirm({ orderId: order.id, action: "Completed" })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition">
                  <Check size={12} /> Mark Complete
                </button>
              )}
            </div>

            {/* ORDER ITEMS EXPANDED */}
            {expanded === order.id && orderItems[order.id] && (
              <div className="border-t border-gray-50 px-6 py-4 bg-gray-50/40 space-y-3">
                {orderItems[order.id].length === 0 && (
                  <p className="text-xs text-gray-400 text-center">No items found</p>
                )}
                {orderItems[order.id].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.products?.image_url
                      ? <img src={item.products.image_url} alt={item.products?.name} className="w-10 h-10 rounded-xl object-cover bg-white" />
                      : <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center"><Package size={16} className="text-pink-300" /></div>
                    }
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.products?.name ?? "Unknown"}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#4b2e2e] text-sm">₱{Number(item.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
