"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import {
  ShoppingBag, MapPin, Phone, Calendar, Clock,
  Check, X, Package, Search, ChevronRight, User, Trash2
} from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryDetails = {
  full_name: string
  phone: string
  address: string
  delivery_date: string
  delivery_time: string
}

type Order = {
  id: string
  total_amount: number
  payment: string
  status: string
  created_at: string
  receipt_url?: string | null
  delivery_details?: DeliveryDetails | null
}

type OrderItem = {
  quantity: number
  price: number
  products?: { name: string; image_url?: string } | { name: string; image_url?: string }[] | null
}

type ActionConfirm = { orderId: string; action: string } | null

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FLOW = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"]

const STATUS_COLOR: Record<string, string> = {
  Pending:            "bg-gray-100 text-gray-500 border-gray-200",
  Confirmed:          "bg-blue-50 text-blue-600 border-blue-100",
  Preparing:          "bg-orange-50 text-orange-500 border-orange-100",
  "Out for Delivery": "bg-purple-50 text-purple-600 border-purple-100",
  Delivered:          "bg-green-50 text-green-600 border-green-100",
  Cancelled:          "bg-red-50 text-red-500 border-red-100",
}

const STATUS_ICON: Record<string, string> = {
  Pending: "Pending", Confirmed: "Confirmed", Preparing: "Preparing",
  "Out for Delivery": "Out for Delivery", Delivered: "Delivered", Cancelled: "Cancelled",
}

function nextStatus(current: string): string | null {
  const idx = STATUS_FLOW.indexOf(current)
  return idx === -1 || idx === STATUS_FLOW.length - 1 ? null : STATUS_FLOW[idx + 1]
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────

function OrderDrawer({
  order,
  onClose,
  onAction,
}: {
  order: Order
  onClose: () => void
  onAction: (orderId: string, action: string) => void
}) {
  const [items, setItems] = useState<OrderItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [receiptOpen, setReceiptOpen] = useState(false)

  useEffect(() => {
    supabase
      .from("order_items")
      .select("quantity, price, products!order_items_product_id_fkey(name, image_url)")
      .eq("order_id", order.id)
      .then(({ data }) => { setItems(data ?? []); setLoadingItems(false) })
  }, [order.id])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const next = nextStatus(order.status)
  const isGcash = order.payment?.toLowerCase() === "gcash"
  const dd = order.delivery_details

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <p className="font-bold text-gray-800">Order #{String(order.id).slice(0, 8)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLOR[order.status] ?? STATUS_COLOR.Pending}`}>
              {STATUS_ICON[order.status]} {order.status}
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* CUSTOMER INFO */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Customer &amp; Delivery</p>
            {dd ? (
              <div className="bg-[#fdf6f6] rounded-2xl p-4 space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <User size={14} className="text-[#4b2e2e] shrink-0" />
                  <span className="font-semibold">{dd.full_name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Phone size={14} className="text-[#4b2e2e] shrink-0" />
                  <span>{dd.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 text-gray-600">
                  <MapPin size={14} className="text-[#4b2e2e] shrink-0 mt-0.5" />
                  <span>{dd.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Calendar size={14} className="text-[#4b2e2e] shrink-0" />
                  <span>{new Date(dd.delivery_date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Clock size={14} className="text-[#4b2e2e] shrink-0" />
                  <span>{dd.delivery_time}</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
                <p className="font-semibold">No delivery details found</p>
                <p className="text-xs mt-0.5 text-amber-600">The customer may not have completed checkout properly.</p>
              </div>
            )}
          </div>

          {/* ORDER ITEMS */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
            {loadingItems ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No items found.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, i) => {
                  const prod = Array.isArray(item.products) ? item.products[0] : item.products
                  return (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      {prod?.image_url
                        ? <img src={prod.image_url} alt={prod.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center shrink-0"><Package size={16} className="text-pink-300" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{prod?.name ?? "Unknown"}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-[#4b2e2e] text-sm shrink-0">₱{(Number(item.price) * item.quantity).toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* PAYMENT SUMMARY */}
          <div className="bg-[#fdf6f6] rounded-2xl p-4 text-sm space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Summary</p>
            <div className="flex justify-between text-gray-600">
              <span>Payment Method</span>
              <span className="font-semibold">{isGcash ? "GCash" : "Cash on Delivery"}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-[#f0e0e0] pt-2 mt-1">
              <span>Total</span>
              <span className="text-[#4b2e2e]">₱{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>

          {/* GCASH RECEIPT */}
          {isGcash && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">GCash Receipt</p>
              {order.receipt_url ? (
                <>
                  <img
                    src={order.receipt_url}
                    alt="GCash Receipt"
                    className="w-full rounded-2xl object-contain max-h-64 border border-gray-100 cursor-zoom-in"
                    onClick={() => setReceiptOpen(true)}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-center">Click to enlarge</p>
                </>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <p className="text-sm font-semibold text-red-500">No receipt uploaded</p>
                  <p className="text-xs text-red-400 mt-0.5">Verify with customer before confirming</p>
                </div>
              )}
            </div>
          )}

          {/* STATUS FLOW */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Order Status</p>
            <div className="space-y-1.5">
              {STATUS_FLOW.map((step, i) => {
                const currentIdx = STATUS_FLOW.indexOf(order.status)
                const done = i <= currentIdx
                const isCurrent = i === currentIdx
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0
                      ${isCurrent ? "bg-[#4b2e2e] border-[#4b2e2e] text-white"
                        : done ? "bg-[#4b2e2e]/10 border-[#4b2e2e] text-[#4b2e2e]"
                        : "bg-white border-gray-200 text-gray-300"}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm ${isCurrent ? "font-bold text-[#4b2e2e]" : done ? "text-gray-600" : "text-gray-300"}`}>
                      {step}
                    </span>
                    {isCurrent && <span className="text-[10px] bg-[#4b2e2e] text-white px-2 py-0.5 rounded-full font-bold">Current</span>}
                  </div>
                )
              })}
              {order.status === "Cancelled" && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-red-50 border-red-300 text-red-500 shrink-0">✕</div>
                  <span className="text-sm font-bold text-red-500">Cancelled</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer — ordered: Confirm → Cancel → Delete */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2 shrink-0">
          {next && order.status !== "Cancelled" && (
            <button
              onClick={() => { onAction(order.id, next); onClose() }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#4b2e2e] text-white rounded-xl font-bold text-sm hover:bg-[#3a2323] transition"
            >
              <Check size={14} /> Mark as {next}
            </button>
          )}
          {order.status !== "Cancelled" && order.status !== "Delivered" && (
            <button
              onClick={() => { onAction(order.id, "Cancelled"); onClose() }}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition"
            >
              <X size={14} /> Cancel Order
            </button>
          )}
          {order.status === "Cancelled" && (
            <button
              onClick={() => { onAction(order.id, "Delete"); onClose() }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition"
            >
              <Trash2 size={14} /> Delete Order
            </button>
          )}
        </div>
      </div>

      {/* Receipt fullscreen */}
      {receiptOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setReceiptOpen(false)}>
          <img src={order.receipt_url!} alt="Receipt" className="max-w-full max-h-full rounded-2xl object-contain" />
        </div>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType>(null)
  const [confirm, setConfirm] = useState<ActionConfirm>(null)
  const [filterStatus, setFilterStatus] = useState("All")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Order | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("orders")
      .select("*, delivery_details(full_name, phone, address, delivery_date, delivery_time)")
      .order("created_at", { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAction(orderId: string, action: string) {
    if (action === "Delete") {
      setConfirm({ orderId, action })
      return
    }
    setConfirm({ orderId, action })
  }

  async function executeAction() {
    if (!confirm) return
    const { orderId, action } = confirm
    setConfirm(null)

    if (action === "Delete") {
      // Delete in FK-safe order: history → items → delivery_details → order
      await supabase.from("order_status_history").delete().eq("order_id", orderId)
      await supabase.from("order_items").delete().eq("order_id", orderId)
      await supabase.from("delivery_details").delete().eq("order_id", orderId)
      const { error } = await supabase.from("orders").delete().eq("id", orderId)
      if (error) { setToast({ message: "Failed to delete order: " + error.message, type: "error" }); return }
      setToast({ message: "Order deleted.", type: "success" })
      load(); return
    }

    const { error } = await supabase.from("orders").update({ status: action }).eq("id", orderId)
    if (error) { setToast({ message: "Failed to update order.", type: "error" }); return }
    await supabase.from("order_status_history").insert({ order_id: orderId, status: action })
    setToast({ message: `Order marked as "${action}".`, type: "success" })
    load()
  }

  const filtered = orders
    .filter(o => filterStatus === "All" || o.status === filterStatus)
    .filter(o => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (o.delivery_details?.full_name ?? "").toLowerCase().includes(q)
        || String(o.id).toLowerCase().includes(q)
    })

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {confirm && (
        <ConfirmModal
          message={confirm.action === "Delete"
            ? "Delete this order permanently? This cannot be undone."
            : `Mark this order as "${confirm.action}"?`}
          onConfirm={executeAction}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Detail Drawer */}
      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center gap-2">
        <ShoppingBag size={22} className="text-[#4b2e2e]" />
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Orders</h1>
          <p className="text-gray-400 text-sm">{orders.length} total orders</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or order ID..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#4b2e2e]"
          />
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

      {/* Orders Table */}
      <div className="space-y-3">
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
          const dd = order.delivery_details

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">

                {/* Left: customer info */}
                <div className="flex items-start gap-3 flex-wrap min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#fdf6f6] border border-[#f0e0e0] flex items-center justify-center shrink-0">
                    <User size={16} className="text-[#4b2e2e]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{dd?.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-400 font-mono">#{String(order.id).slice(0, 8)}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                      {dd?.phone && <span className="flex items-center gap-1"><Phone size={10} />{dd.phone}</span>}
                      {dd?.address && <span className="flex items-center gap-1 truncate max-w-[200px]"><MapPin size={10} />{dd.address}</span>}
                      {dd?.delivery_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(dd.delivery_date + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          {dd.delivery_time && ` · ${dd.delivery_time}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: amount + status + actions */}
                <div className="flex items-center gap-3 flex-wrap shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-[#4b2e2e] text-sm">₱{Number(order.total_amount).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{isGcash ? "GCash" : "COD"}</p>
                  </div>

                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLOR[order.status] ?? STATUS_COLOR.Pending}`}>
                    {STATUS_ICON[order.status]} {order.status}
                  </span>

                  {/* Quick action buttons — View Details | Confirm | Cancel | Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelected(order)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                      View Details <ChevronRight size={11} />
                    </button>
                    {next && order.status !== "Cancelled" && (
                      <button
                        onClick={() => handleAction(order.id, next)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4b2e2e] text-white text-xs font-semibold hover:bg-[#3a2323] transition"
                      >
                        <Check size={11} /> {next}
                      </button>
                    )}
                    {order.status !== "Cancelled" && order.status !== "Delivered" && (
                      <button
                        onClick={() => handleAction(order.id, "Cancelled")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                      >
                        <X size={11} /> Cancel
                      </button>
                    )}
                    {order.status === "Cancelled" && (
                      <button
                        onClick={() => handleAction(order.id, "Delete")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* GCash receipt badge — inside the card, below the row */}
              {isGcash && (
                <div className="px-5 pb-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${hasReceipt ? "bg-blue-50 text-blue-500 border-blue-100" : "bg-red-50 text-red-400 border-red-100"}`}>
                    {hasReceipt ? "Receipt Uploaded" : "No Receipt — verify before confirming"}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
