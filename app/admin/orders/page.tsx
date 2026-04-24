"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ShoppingBag, MapPin, Phone, ChevronDown, ChevronUp, Check, X, Package, Search } from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"

type Order = {
  id: string
  full_name: string
  total_amount: number
  payment: string
  status: string
  created_at: string
  address: string
  contact_number: string
  delivery_date?: string | null
  delivery_time?: string | null
  recipient_message?: string | null
  receipt_url?: string | null
}

type ActionConfirm = { orderId: string; action: string } | null

const STATUS_FLOW = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"]

const statusColor: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-500 border-gray-200",
  Confirmed: "bg-blue-50 text-blue-600 border-blue-100",
  Preparing: "bg-orange-50 text-orange-500 border-orange-100",
  "Out for Delivery": "bg-purple-50 text-purple-600 border-purple-100",
  Delivered: "bg-green-50 text-green-600 border-green-100",
  Cancelled: "bg-red-50 text-red-500 border-red-100",
}

function nextStatus(current: string): string | null {
  const idx = STATUS_FLOW.indexOf(current)
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null
  return STATUS_FLOW[idx + 1]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType>(null)
  const [confirm, setConfirm] = useState<ActionConfirm>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({})
  const [filterStatus, setFilterStatus] = useState("All")
  const [search, setSearch] = useState("")
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function loadItems(orderId: string) {
    if (orderItems[orderId]) { setExpanded(expanded === orderId ? null : orderId); return }
    const { data, error } = await supabase
      .from("order_items")
      .select("quantity, price, product_id, products!order_items_product_id_fkey(name, image_url)")
      .eq("order_id", orderId)
    if (error) console.error("Order items error:", error.message)
    setOrderItems(prev => ({ ...prev, [orderId]: data ?? [] }))
    setExpanded(orderId)
  }

  async function handleAction() {
    if (!confirm) return
    const { orderId, action } = confirm
    setConfirm(null)

    if (action === "Delete") {
      await supabase.from("order_items").delete().eq("order_id", orderId)
      const { error } = await supabase.from("orders").delete().eq("id", orderId)
      if (error) { setToast({ message: "Failed to delete order.", type: "error" }); return }
      setToast({ message: "Order deleted.", type: "success" })
      load(); return
    }

    const { error } = await supabase.from("orders").update({ status: action }).eq("id", orderId)
    if (error) { setToast({ message: "Failed to update order.", type: "error" }); return }
    // log to history (trigger handles it, but insert as fallback if trigger not set up)
    await supabase.from("order_status_history").insert({ order_id: orderId, status: action })
    setToast({ message: `Order marked as "${action}".`, type: "success" })
    load()
  }

  const filtered = orders
    .filter(o => filterStatus === "All" || o.status === filterStatus)
    .filter(o => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return o.full_name?.toLowerCase().includes(q) || String(o.id).toLowerCase().includes(q)
    })

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {confirm && (
        <ConfirmModal
          message={confirm.action === "Delete"
            ? "Delete this order? This cannot be undone."
            : `Mark this order as "${confirm.action}"?`}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* RECEIPT MODAL */}
      {receiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setReceiptOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">GCash Receipt</h3>
              <button onClick={() => setReceiptOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {receiptUrl ? (
              <img src={receiptUrl} alt="GCash Receipt" className="w-full rounded-2xl object-contain max-h-96" />
            ) : (
              <div className="py-10 text-center text-gray-400">
                <p className="text-4xl mb-2">📎</p>
                <p className="text-sm font-medium text-red-400">No receipt uploaded</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <ShoppingBag size={22} className="text-[#4b2e2e]" />
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Orders</h1>
          <p className="text-gray-400 text-sm">{orders.length} total orders</p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or order ID..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#4b2e2e]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition border ${filterStatus === s ? "bg-[#4b2e2e] text-white border-[#4b2e2e]" : "bg-white text-gray-500 border-gray-200 hover:border-[#4b2e2e] hover:text-[#4b2e2e]"}`}>
              {s}
            </button>
          ))}
        </div>
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

        {filtered.map(order => {
          const next = nextStatus(order.status)
          const isGcash = order.payment?.toLowerCase() === "gcash"
          const hasReceipt = !!order.receipt_url

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">

              {/* ORDER HEADER */}
              <div className="px-6 py-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{order.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-400 font-mono">#{String(order.id).slice(0, 8)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs text-gray-400 space-y-0.5 mt-0.5">
                    <p className="flex items-center gap-1"><MapPin size={11} /> {order.address || "—"}</p>
                    <p className="flex items-center gap-1"><Phone size={11} /> {order.contact_number || "—"}</p>
                    {order.delivery_date && (
                      <p className="flex items-center gap-1">📅 {new Date(order.delivery_date + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}{order.delivery_time ? ` · ${order.delivery_time}` : ""}</p>
                    )}
                    {order.recipient_message && (
                      <p className="flex items-center gap-1 italic text-gray-400">💬 "{order.recipient_message}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-right">
                    <p className="font-bold text-[#4b2e2e]">₱{Number(order.total_amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase">{order.payment}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor[order.status] ?? statusColor.Pending}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* GCash receipt warning */}
              {isGcash && !hasReceipt && order.status === "Pending" && (
                <div className="mx-6 mb-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-500 font-medium">
                  ⚠️ No receipt uploaded — verify before confirming
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="px-6 pb-4 flex items-center gap-2 flex-wrap border-t border-gray-50 pt-3">
                <button onClick={() => loadItems(order.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition">
                  {expanded === order.id ? <><ChevronUp size={12} /> Hide Items</> : <><ChevronDown size={12} /> View Items</>}
                </button>

                {isGcash && (
                  <button onClick={() => { setReceiptUrl(order.receipt_url || null); setReceiptOpen(true) }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${hasReceipt ? "border-blue-100 text-blue-500 hover:bg-blue-50" : "border-red-100 text-red-400 hover:bg-red-50"}`}>
                    📎 {hasReceipt ? "View Receipt" : "No Receipt"}
                  </button>
                )}

                {next && order.status !== "Cancelled" && (
                  <button onClick={() => setConfirm({ orderId: order.id, action: next })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4b2e2e] text-white text-xs font-semibold hover:bg-[#3a2323] transition">
                    <Check size={12} /> Mark as {next}
                  </button>
                )}

                {order.status !== "Cancelled" && order.status !== "Delivered" && (
                  <button onClick={() => setConfirm({ orderId: order.id, action: "Cancelled" })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                    <X size={12} /> Cancel
                  </button>
                )}

                {order.status === "Cancelled" && (
                  <button onClick={() => setConfirm({ orderId: order.id, action: "Delete" })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition">
                    <X size={12} /> Delete Order
                  </button>
                )}
              </div>

              {/* EXPANDED ITEMS */}
              {expanded === order.id && orderItems[order.id] && (
                <div className="border-t border-gray-50 px-6 py-4 bg-gray-50/40 space-y-3">
                  {orderItems[order.id].length === 0 && <p className="text-xs text-gray-400 text-center">No items found</p>}
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
          )
        })}
      </div>
    </div>
  )
}
