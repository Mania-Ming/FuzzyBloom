"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"
import { X, MapPin, Phone, Calendar, Clock, Package, Truck, CheckCircle, Loader, BadgeCheck, ClockIcon } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {
  name: string
  qty: number
  price: number
  img?: string
}

type LiveItem = {
  quantity: number
  price: number
  products: { name: string; image_url?: string } | null
}

type DeliveryDetails = {
  full_name: string
  phone: string
  address: string
  delivery_date: string
  delivery_time: string
}

type Order = {
  id: string
  created_at: string
  total: number
  total_amount: number
  payment: string
  status: string
  items: OrderItem[]
  subtotal?: number
  shipping?: number
  delivery_details?: DeliveryDetails | null
}

type StatusHistory = {
  status: string
  changed_at: string
  note?: string
}

// ─── Image helper ────────────────────────────────────────────────────────────
function resolveImage(src: string | null | undefined, fallback = "/logo.jpg"): string {
  if (!src) return fallback
  if (src.startsWith("http")) return src
  return src.startsWith("/") ? src : `/${src}`
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STEPS = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"]

const STATUS_BADGE: Record<string, string> = {
  Pending:            "bg-gray-100 text-gray-500 border-gray-200",
  Confirmed:          "bg-blue-50 text-blue-600 border-blue-100",
  Preparing:          "bg-orange-50 text-orange-500 border-orange-100",
  "Out for Delivery": "bg-purple-50 text-purple-600 border-purple-100",
  Delivered:          "bg-green-50 text-green-600 border-green-100",
  Cancelled:          "bg-red-50 text-red-500 border-red-100",
}

function StatusIcon({ status, size = 14 }: { status: string; size?: number }) {
  const cls = `shrink-0`
  if (status === "Pending")           return <ClockIcon size={size} className={cls} />
  if (status === "Confirmed")         return <CheckCircle size={size} className={cls} />
  if (status === "Preparing")         return <Loader size={size} className={cls} />
  if (status === "Out for Delivery")  return <Truck size={size} className={cls} />
  if (status === "Delivered")         return <BadgeCheck size={size} className={cls} />
  if (status === "Cancelled")         return <X size={size} className={cls} />
  return <Package size={size} className={cls} />
}

// ─── Status Timeline ──────────────────────────────────────────────────────────

function StatusTimeline({ status, history }: { status: string; history: StatusHistory[] }) {
  if (status === "Cancelled") {
    const cancelledAt = history.find(h => h.status === "Cancelled")?.changed_at
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-100">
        <X size={18} className="text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-500">Order Cancelled</p>
          {cancelledAt && (
            <p className="text-xs text-red-400 mt-0.5">
              {new Date(cancelledAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_STEPS.indexOf(status)

  return (
    <div className="space-y-1">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx
        const isCurrent = i === currentIdx
        const historyEntry = history.find(h => h.status === step)
        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 w-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${isCurrent ? "bg-[#4b2e2e] border-[#4b2e2e] text-white shadow-md shadow-[#4b2e2e]/20 scale-110"
                  : done ? "bg-[#4b2e2e]/10 border-[#4b2e2e] text-[#4b2e2e]"
                  : "bg-white border-gray-200 text-gray-300"}`}>
                <StatusIcon status={step} size={13} />
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`w-0.5 h-6 mt-1 rounded-full ${i < currentIdx ? "bg-[#4b2e2e]/30" : "bg-gray-100"}`} />
              )}
            </div>
            <div className={`pb-4 flex-1 ${i === STATUS_STEPS.length - 1 ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${isCurrent ? "text-[#4b2e2e]" : done ? "text-gray-700" : "text-gray-300"}`}>
                  {step}
                </span>
                {isCurrent && <span className="text-[10px] font-bold bg-[#4b2e2e] text-white px-2 py-0.5 rounded-full">Current</span>}
              </div>
              {historyEntry && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(historyEntry.changed_at).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [liveItems, setLiveItems] = useState<LiveItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("order_status_history")
      .select("status, changed_at, note")
      .eq("order_id", order.id)
      .order("changed_at", { ascending: true })
      .then(({ data }) => setHistory(data ?? []))
  }, [order.id])

  // Fetch live order items from order_items → products
  useEffect(() => {
    supabase
      .from("order_items")
      .select("quantity, price, products ( name, image_url )")
      .eq("order_id", order.id)
      .then(({ data }) => {
        const rows = (data ?? []).map((i: any) => ({
          quantity: i.quantity,
          price: i.price,
          products: Array.isArray(i.products) ? (i.products[0] ?? null) : (i.products ?? null),
        }))
        setLiveItems(rows)
        setItemsLoading(false)
      })
  }, [order.id])

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const subtotal = order.subtotal ?? liveItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0)
  const shipping = order.shipping ?? 20
  const total = order.total_amount || order.total || subtotal + shipping

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 pt-5 pb-4 border-b border-gray-50 flex items-center justify-between z-10 rounded-t-3xl">
          <div>
            <p className="font-bold text-gray-800 text-base">Order #{String(order.id).slice(0, 8)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_BADGE[order.status] ?? STATUS_BADGE.Pending}`}>
              {order.status}
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* STATUS TIMELINE */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Status</p>
            <StatusTimeline status={order.status} history={history} />
          </div>

          {/* ITEMS — from live order_items join */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
            {itemsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : liveItems.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No items found.</p>
            ) : (
              <div className="space-y-3">
                {liveItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#fdf6f6] rounded-2xl p-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                      {item.products?.image_url ? (
                        <img
                          src={resolveImage(item.products.image_url)}
                          alt={item.products.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/logo.jpg" }}
                        />
                      ) : (
                        <Package size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{item.products?.name ?? "N/A"}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#4b2e2e] text-sm shrink-0">
                      ₱{(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRICE BREAKDOWN */}
          <div className="bg-[#fdf6f6] rounded-2xl p-4 space-y-2 text-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price Breakdown</p>
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>₱{shipping}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-[#f0e0e0] pt-2 mt-1">
              <span>Total</span><span className="text-[#4b2e2e]">₱{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span>Payment</span>
              <span className="font-semibold">{order.payment?.toLowerCase() === "gcash" ? "GCash" : "Cash on Delivery"}</span>
            </div>
          </div>

          {/* DELIVERY DETAILS */}
          {order.delivery_details ? (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Delivery Details</p>
              <div className="bg-[#fdf6f6] rounded-2xl p-4 space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Package size={13} className="text-[#4b2e2e] shrink-0" />
                  <span className="font-semibold">{order.delivery_details.full_name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Phone size={13} className="text-[#4b2e2e] shrink-0" />
                  <span>{order.delivery_details.phone || "N/A"}</span>
                </div>
                <div className="flex items-start gap-2.5 text-gray-600">
                  <MapPin size={13} className="text-[#4b2e2e] shrink-0 mt-0.5" />
                  <span>{order.delivery_details.address || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Calendar size={13} className="text-[#4b2e2e] shrink-0" />
                  <span>
                    {order.delivery_details.delivery_date
                      ? new Date(order.delivery_details.delivery_date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Clock size={13} className="text-[#4b2e2e] shrink-0" />
                  <span>{order.delivery_details.delivery_time || "N/A"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
              <p className="font-semibold">Delivery details not available</p>
            </div>
          )}

        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-3 rounded-full border-2 border-[#4b2e2e] text-[#4b2e2e] font-bold text-sm hover:bg-[#4b2e2e] hover:text-white transition">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onTrack }: { order: Order; onTrack: () => void }) {
  const total = order.total_amount || order.total || 0

  return (
    <div className="bg-white/90 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden w-full">

      {/* Card Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 flex-wrap border-b border-gray-50">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <p className="font-bold text-gray-800 text-sm">Order #{String(order.id).slice(0, 8)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
          {/* Items inline preview */}
          <div className="flex items-center gap-1.5">
            {order.items?.slice(0, 4).map((item, i) => (
              <div key={i} className="w-9 h-9 rounded-lg bg-[#fdf6f6] border border-[#f0e0e0] overflow-hidden shrink-0">
                <Image src={item.img || "/logo.jpg"} alt={item.name} width={36} height={36} className="object-cover w-full h-full" />
              </div>
            ))}
            {(order.items?.length ?? 0) > 4 && (
              <span className="text-xs text-gray-400 font-semibold">+{order.items.length - 4}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-right">
            <p className="font-bold text-[#4b2e2e] text-sm">₱{Number(total).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 uppercase">{order.payment}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${STATUS_BADGE[order.status] ?? STATUS_BADGE.Pending}`}>
            <StatusIcon status={order.status} size={11} />
            {order.status || "Pending"}
          </span>
        </div>
      </div>

      {/* Delivery + mini timeline row */}
      <div className="px-5 py-3 flex items-center gap-4 flex-wrap">
        {(order.delivery_details?.delivery_date || order.delivery_details?.delivery_time) && (
          <div className="flex items-center gap-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5 flex-wrap">
            {order.delivery_details?.delivery_date && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {new Date(order.delivery_details.delivery_date + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            {order.delivery_details?.delivery_time && (
              <span className="flex items-center gap-1"><Clock size={11} /> {order.delivery_details.delivery_time}</span>
            )}
          </div>
        )}
        {order.status !== "Cancelled" && (
          <div className="flex items-center gap-0 flex-1 min-w-[160px]">
            {STATUS_STEPS.map((step, i) => {
              const currentIdx = STATUS_STEPS.indexOf(order.status)
              const done = i <= currentIdx
              const isLast = i === STATUS_STEPS.length - 1
              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 transition-all ${done ? "bg-[#4b2e2e]" : "bg-gray-200"} ${i === currentIdx ? "scale-150" : ""}`} />
                  {!isLast && <div className={`h-0.5 flex-1 ${i < currentIdx ? "bg-[#4b2e2e]/40" : "bg-gray-100"}`} />}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-400">
          {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
        </p>
        <button
          onClick={onTrack}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#4b2e2e] text-white text-xs font-bold rounded-full hover:bg-[#3a2323] transition shadow-sm shadow-[#4b2e2e]/20"
        >
          <Truck size={13} /> Track Order
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: user } = useMe()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState("All")

  const load = useCallback(async (userId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from("orders")
      .select("*, delivery_details(full_name, phone, address, delivery_date, delivery_time)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user?.id) return
    load(user.id)
  }, [user?.id, load])

  // realtime status updates
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel("orders-user")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...(payload.new as Partial<Order>) } : o))
          setSelected(prev => prev?.id === payload.new.id ? { ...prev, ...(payload.new as Partial<Order>) } as Order : prev)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const filtered = filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />

        <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-10">

          {/* Page Header */}
          <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>My Orders</h1>
              <p className="text-gray-500 text-sm mt-1">
                {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
              </p>
            </div>
            <Link href="/dashboard"
              className="text-xs font-semibold text-[#4b2e2e] border border-[#4b2e2e]/30 px-4 py-2 rounded-full hover:bg-[#4b2e2e] hover:text-white transition">
              + Shop More
            </Link>
          </div>

          {/* Status Filter Tabs */}
          {orders.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {["All", "Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${filterStatus === s ? "bg-[#4b2e2e] text-white border-[#4b2e2e]" : "bg-white text-gray-500 border-gray-200 hover:border-[#4b2e2e] hover:text-[#4b2e2e]"}`}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-24 bg-white/60 rounded-3xl border border-white/60 fade-up">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="font-bold text-gray-600 text-lg">You have no orders yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">Start shopping and your orders will appear here.</p>
              <Link href="/dashboard"
                className="inline-block bg-[#4b2e2e] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20">
                Browse Products
              </Link>
            </div>
          )}

          {/* No results for filter */}
          {!loading && orders.length > 0 && filtered.length === 0 && (
            <div className="text-center py-16 bg-white/60 rounded-3xl border border-white/60">
              <Package size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No {filterStatus} orders</p>
            </div>
          )}

          {/* Orders — single column full-width */}
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onTrack={() => setSelected(order)} />
            ))}
          </div>

        </main>

        <Footer />
      </div>

      {/* Track Order Modal */}
      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} />}
    </ProtectedRoute>
  )
}
