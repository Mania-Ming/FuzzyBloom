"use client"

import { useEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { supabase } from "@/lib/supabase"
import {
  ShoppingBag, MapPin, Phone, Calendar, Clock,
  Check, X, Package, Search, ChevronRight, User, Trash2, Bike
} from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"

// ─── Helpers ────────────────────────────────────────────────────────────────

function resolveImage(src: string | null | undefined, fallback = "/logo.jpg"): string {
  if (!src) return fallback
  if (src.startsWith("http")) return src
  return src.startsWith("/") ? src : `/${src}`
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A"
  const d = new Date(dateStr + "T00:00:00")
  if (isNaN(d.getTime())) return "N/A"
  return d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
}

type DeliveryDetails = {
  delivery_type: string
  full_name: string
  phone: string
  address: string
  delivery_date: string
  delivery_time: string
  rider_name?: string | null
  rider_contact?: string | null
}

type OrderItemRow = {
  quantity: number
  price: number
  products: { name: string; image_url?: string } | null
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

type FullOrder = Order & {
  order_items: OrderItemRow[]
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

function nextStatus(current: string): string | null {
  const idx = STATUS_FLOW.indexOf(current)
  return idx === -1 || idx === STATUS_FLOW.length - 1 ? null : STATUS_FLOW[idx + 1]
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────

function OrderDrawer({
  orderId,
  onClose,
  onAction,
}: {
  orderId: string
  onClose: () => void
  onAction: (orderId: string, action: string) => void
}) {
  const [order, setOrder] = useState<FullOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [riders, setRiders] = useState<{ id: string; name: string; phone: string }[]>([])
  const [selectedRiderId, setSelectedRiderId] = useState("")

  useEffect(() => {
    async function fetchFull() {
      setLoading(true)

      // Fetch order without FK hint to avoid 406 ambiguous relationship error
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("id, total_amount, payment, status, created_at, receipt_url, items")
        .eq("id", orderId)
        .single()

      if (orderErr) { console.error("Order fetch error:", orderErr.message); setLoading(false); return }

      // Fetch delivery_details + assigned rider separately
      const { data: ddData } = await supabase
        .from("delivery_details")
        .select("delivery_type, full_name, phone, address, delivery_date, delivery_time, rider_id, riders ( id, name, phone )")
        .eq("order_id", orderId)
        .maybeSingle()

      const { data: riderData } = await supabase.from("riders").select("id, name, phone").order("name")

      setOrder({ ...orderData, delivery_details: ddData ?? null, order_items: [] })
      // Pre-select current rider if assigned
      if (ddData?.rider_id) setSelectedRiderId(ddData.rider_id)
      setRiders(riderData ?? [])
      setLoading(false)
    }
    fetchFull()
  }, [orderId])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  if (loading || !order) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
      </div>,
      document.body
    )
  }

  const next = nextStatus(order.status)
  const isGcash = order.payment?.toLowerCase() === "gcash"
  const dd = order.delivery_details
  const isDelivery = dd?.delivery_type === "delivery"

  async function assignRider(orderId: string, riderId: string) {
    const res = await fetch("/api/orders/assign-rider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, riderId }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert("Failed to assign rider: " + data.error)
      return
    }
    setOrder(prev => prev ? { ...prev, delivery_details: data.delivery_details ?? prev.delivery_details } : prev)
    onAction(orderId, "__reload__")
  }

  const displayName    = dd?.full_name    || "N/A"
  const displayPhone   = dd?.phone        || "N/A"
  const displayAddress = dd?.address      || "N/A"
  const displayDate    = formatDate(dd?.delivery_date)
  const displayTime    = dd?.delivery_time || "N/A"

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

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
              {order.status}
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* CUSTOMER & DELIVERY */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Customer &amp; Delivery</p>
            <div className="bg-[#fdf6f6] rounded-2xl p-4 space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-gray-700">
                <User size={14} className="text-[#4b2e2e] shrink-0" />
                <span className="font-semibold">{displayName}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600">
                <Phone size={14} className="text-[#4b2e2e] shrink-0" />
                <span>{displayPhone}</span>
              </div>
              <div className="flex items-start gap-2.5 text-gray-600">
                <MapPin size={14} className="text-[#4b2e2e] shrink-0 mt-0.5" />
                <span>{displayAddress}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600">
                <Calendar size={14} className="text-[#4b2e2e] shrink-0" />
                <span>{displayDate}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600">
                <Clock size={14} className="text-[#4b2e2e] shrink-0" />
                <span>{displayTime}</span>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS from JSONB */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
            {(() => {
              const jsonItems: any[] = Array.isArray((order as any).items) ? (order as any).items : []
              return jsonItems.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No items found.</p>
              ) : (
                <div className="space-y-2">
                  {jsonItems.map((item: any, i: number) => {
                    const qty = item.qty ?? item.quantity ?? 1
                    const imgSrc = item.img || item.image_url
                    return (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        {imgSrc ? (
                          <img
                            src={resolveImage(imgSrc)}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/logo.jpg" }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                            <Package size={16} className="text-pink-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.name ?? "N/A"}</p>
                          <p className="text-xs text-gray-400">Qty: {qty}</p>
                        </div>
                        <p className="font-bold text-[#4b2e2e] text-sm shrink-0">
                          ₱{(Number(item.price) * qty).toLocaleString()}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* PAYMENT SUMMARY */}
          <div className="bg-[#fdf6f6] rounded-2xl p-4 text-sm space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Summary</p>
            {dd?.delivery_type && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery Method</span>
                <span className="font-semibold capitalize">{dd.delivery_type}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Payment Method</span>
              <span className="font-semibold">{order.payment || "Cash on Delivery"}</span>
            </div>
            {dd?.delivery_type === "delivery" && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-semibold">₱35</span>
              </div>
            )}
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

          {/* RIDER ASSIGNMENT — delivery only */}
          {isDelivery && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Rider Assignment</p>

              {/* Show assigned rider if exists */}
              {(dd as any)?.riders ? (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 space-y-2 text-sm mb-3">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Bike size={14} className="shrink-0" />
                    <span className="font-semibold">{(dd as any).riders.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600">
                    <Phone size={13} className="shrink-0" />
                    <span>{(dd as any).riders.phone}</span>
                  </div>
                  <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wide">Rider Assigned</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-3 text-xs text-gray-400 mb-3 text-center">
                  No rider assigned yet
                </div>
              )}

              {/* Rider dropdown */}
              <div className="space-y-2">
                <select
                  value={selectedRiderId}
                  onChange={e => setSelectedRiderId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4b2e2e] transition bg-white"
                >
                  <option value="">Select a rider...</option>
                  {riders.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — {r.phone}</option>
                  ))}
                </select>
                <button
                  onClick={() => order && assignRider(order.id, selectedRiderId)}
                  disabled={!selectedRiderId}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bike size={14} />
                  {(dd as any)?.riders ? "Update Rider" : "Assign Rider"}
                </button>
              </div>
            </div>
          )}

          {/* STATUS TIMELINE */}
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

        {/* Action Footer */}
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
    </div>,
    document.body
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
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        created_at,
        items,
        payment,
        receipt_url,
        delivery_details!delivery_details_order_id_fkey (
          delivery_type,
          full_name,
          phone,
          address,
          delivery_date,
          delivery_time,
          rider_id
        )
      `)
      .order("created_at", { ascending: false })

    if (error) console.error("Admin orders fetch error:", error.message)

    const normalized = (data ?? []).map((o: any) => ({
      ...o,
      delivery_details: Array.isArray(o.delivery_details) ? (o.delivery_details[0] ?? null) : (o.delivery_details ?? null),
    }))

    setOrders(normalized)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAction(orderId: string, action: string) {
    if (action === "__reload__") { load(); return }
    setConfirm({ orderId, action })
  }

  async function executeAction() {
    if (!confirm) return
    const { orderId, action } = confirm
    setConfirm(null)

    if (action === "Delete") {
      await supabase.from("order_status_history").delete().eq("order_id", orderId)
      await supabase.from("order_items").delete().eq("order_id", orderId)
      await supabase.from("delivery_details").delete().eq("order_id", orderId)
      const { error } = await supabase.from("orders").delete().eq("id", orderId)
      if (error) { setToast({ message: "Failed to delete order: " + error.message, type: "error" }); return }
      setToast({ message: "Order deleted.", type: "success" })
      load(); return
    }

    const res = await fetch("/api/orders/update-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: action }),
    })
    const data = await res.json()
    if (!res.ok) { setToast({ message: "Failed to update order: " + data.error, type: "error" }); return }
    setToast({ message: `Order marked as "${action}".`, type: "success" })
    load()
  }

  const filtered = orders
    .filter(o => filterStatus === "All" || o.status === filterStatus)
    .filter(o => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      const name = o.delivery_details?.full_name || ""
      return name.toLowerCase().includes(q) || String(o.id).toLowerCase().includes(q)
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

      {selectedId && (
        <OrderDrawer
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
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

      {/* Orders List */}
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
          const displayName = dd?.full_name || "No Name"
          const displayPhone = dd?.phone || "N/A"
          const displayAddress = dd?.address || "N/A"

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">

                {/* Left: customer info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#fdf6f6] border border-[#f0e0e0] flex items-center justify-center shrink-0">
                    <User size={16} className="text-[#4b2e2e]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{displayName}</p>
                    <p className="text-xs text-gray-400 font-mono">#{String(order.id).slice(0, 8)}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Phone size={10} />{displayPhone}</span>
                      <span className="flex items-center gap-1 truncate max-w-[200px]"><MapPin size={10} />{displayAddress}</span>
                      {dd?.delivery_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(dd.delivery_date)}
                          {dd.delivery_time && ` · ${dd.delivery_time}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: amount + status + actions */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <div className="text-right mr-1">
                    <p className="font-bold text-[#4b2e2e] text-sm">₱{Number(order.total_amount).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {(order.delivery_details as any)?.delivery_type
                        ? `${(order.delivery_details as any).delivery_type} · `
                        : ""}{isGcash ? "GCash" : order.payment || "COD"}
                    </p>
                  </div>

                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLOR[order.status] ?? STATUS_COLOR.Pending}`}>
                    {order.status}
                  </span>

                  <button
                    onClick={() => setSelectedId(order.id)}
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
