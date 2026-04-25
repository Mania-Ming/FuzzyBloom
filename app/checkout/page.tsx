"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Truck, Store, MapPin, CreditCard, Wallet, Upload, Calendar, Clock } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useMe } from "@/lib/hooks/useMe"
import { useInsertOrder } from "@/lib/hooks/useInsertOrder"
import { supabase } from "@/lib/supabase"
import { insertDeliveryDetails } from "@/lib/api/auth"

type CartItem = { product_id: string; name: string; price: number; img?: string; qty: number }

const TIME_SLOTS = ["9:00 AM", "1:00 PM", "6:00 PM"]

const DELIVERY_OPTIONS = [
  { value: "delivery", label: "Delivery",  desc: "Delivered by rider",       icon: Truck,  fee: 35 },
  { value: "pickup",   label: "Pick-up",   desc: "Pick up at store",         icon: Store,  fee: 0  },
  { value: "meetup",   label: "Meet-up",   desc: "Meet-up with seller",      icon: MapPin, fee: 0  },
] as const

const DELIVERY_INFO: Record<string, { desc: string; defaultPayment: string }> = {
  delivery: { desc: "Your order will be delivered by a rider.",   defaultPayment: "Cash on Delivery" },
  pickup:   { desc: "You will pick up your order at the shop.",   defaultPayment: "Cash on Arrival"  },
  meetup:   { desc: "Meet-up will be arranged with the seller.",  defaultPayment: "Cash on Arrival"  },
}

function resolveImage(src: string | null | undefined, fallback = "/p2.png"): string {
  if (!src) return fallback
  if (src.startsWith("http")) return src
  return src.startsWith("/") ? src : `/${src}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: user } = useMe()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { mutateAsync: saveOrder } = useInsertOrder()

  // Delivery + payment
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup" | "meetup">("delivery")
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery")
  const [showPopup, setShowPopup] = useState(false)

  // GCash
  const [gcashFile, setGcashFile] = useState<File | null>(null)
  const [gcashPreview, setGcashPreview] = useState<string | null>(null)
  const [receiptError, setReceiptError] = useState("")

  // Form fields
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem("cart") || "[]"))
  }, [])

  useEffect(() => {
    if (!user?.id) return
    supabase.from("profiles").select("address, contact_number, full_name").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setAddress(data.address || "")
          setPhone(data.contact_number || "")
          setFullName(data.full_name || user.full_name || "")
        }
      })
  }, [user?.id])

  const subtotal = cartItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0)
  const shippingFee = deliveryType === "delivery" ? 35 : 0
  const total = subtotal + shippingFee
  const today = new Date().toISOString().split("T")[0]
  const isGcash = paymentMethod === "GCash"

  function handleDeliveryTypeChange(type: "delivery" | "pickup" | "meetup") {
    setDeliveryType(type)
    setPaymentMethod(DELIVERY_INFO[type].defaultPayment)
    setGcashFile(null); setGcashPreview(null); setReceiptError("")
    setErrors({})
    setShowPopup(true)
  }

  function handlePaymentChange(method: string) {
    setPaymentMethod(method)
    setGcashFile(null); setGcashPreview(null); setReceiptError("")
  }

  function handleGcashUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setReceiptError("Only JPG and PNG files are accepted.")
      return
    }
    setReceiptError("")
    setGcashFile(file)
    setGcashPreview(URL.createObjectURL(file))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (deliveryType === "delivery" || deliveryType === "meetup") {
      if (!fullName.trim()) e.fullName = "Full name is required."
      if (!phone.trim()) e.phone = "Phone number is required."
      else if (!/^09\d{9}$/.test(phone.trim())) e.phone = "Enter a valid 11-digit PH number (09XXXXXXXXX)."
      if (!address.trim()) e.address = deliveryType === "delivery" ? "Delivery address is required." : "Meet-up location is required."
    }
    if (!deliveryDate) e.deliveryDate = "Date is required."
    else if (deliveryDate < today) e.deliveryDate = "Date cannot be in the past."
    if (!deliveryTime) e.deliveryTime = "Please select a time slot."
    if (isGcash && !gcashFile) e.receipt = "Please upload your GCash receipt."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function placeOrder() {
    if (cartItems.length === 0) { alert("Cart is empty!"); return }
    if (!validate()) return

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) { alert("You must be logged in."); router.push("/login"); return }

    setSubmitting(true)
    try {
      // 1. Upload GCash receipt
      let receiptUrl: string | null = null
      if (isGcash && gcashFile) {
        const ext = gcashFile.name.split(".").pop() ?? "jpg"
        const filePath = `public/${authUser.id}_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts").upload(filePath, gcashFile, { cacheControl: "3600", upsert: true })
        if (uploadError) throw new Error("Failed to upload receipt: " + uploadError.message)
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(uploadData.path)
        receiptUrl = urlData.publicUrl
      }

      // 2. Insert order with correct total (includes shipping)
      const order = await saveOrder({
        user_id: authUser.id,
        items: cartItems,
        subtotal,
        shipping: shippingFee,
        total,
        total_amount: total,
        payment: paymentMethod,
        status: "Pending",
        receipt_url: receiptUrl,
      })

      // 3. Insert delivery details
      await insertDeliveryDetails({
        order_id: order.id,
        delivery_type: deliveryType,
        full_name: deliveryType === "pickup" ? "" : fullName,
        phone: deliveryType === "pickup" ? "" : phone,
        address: deliveryType === "pickup" ? "" : address,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
      })

      // 4. Validate + insert order items
      const productIds = cartItems.map(i => i.product_id).filter(Boolean)
      const { data: validProducts, error: productCheckError } = await supabase
        .from("products").select("id").in("id", productIds)
      if (productCheckError) throw productCheckError

      const validIds = new Set(validProducts?.map(p => p.id) ?? [])
      const unavailable = cartItems.filter(i => !validIds.has(i.product_id))
      if (unavailable.length > 0) throw new Error(`Items no longer available: ${unavailable.map(i => i.name).join(", ")}`)

      const { error: itemsError } = await supabase.from("order_items").insert(
        cartItems.map(item => ({ order_id: order.id, product_id: item.product_id, quantity: item.qty, price: item.price }))
      )
      if (itemsError) throw itemsError

      // 5. Clear cart
      localStorage.removeItem("cart")
      await supabase.from("cart_items").delete().eq("user_id", authUser.id)

      alert("Order placed successfully! 🎉")
      router.push("/orders")
    } catch (err: any) {
      alert("Failed to place order: " + (err?.message ?? "Unknown error."))
    } finally {
      setSubmitting(false)
    }
  }

  const selectedDelivery = DELIVERY_OPTIONS.find(o => o.value === deliveryType)!
  const paymentOptions = deliveryType === "delivery"
    ? [{ value: "Cash on Delivery", icon: CreditCard }, { value: "GCash", icon: Wallet }]
    : [{ value: "Cash on Arrival",  icon: CreditCard }, { value: "GCash", icon: Wallet }]

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-12 py-8">
          <h1 className="text-2xl text-[#2a1515] mb-6" style={{ fontFamily: "var(--font-pacifico)" }}>Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT — ORDER SUMMARY */}
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700">Order Items</h2>

              {cartItems.length === 0 && (
                <p className="text-gray-400 text-sm">No items in cart. <Link href="/dashboard" className="underline text-[#4b2e2e]">Shop now</Link></p>
              )}

              <div className="space-y-3">
                {cartItems.map((item, i) => (
                  <div key={i} className="bg-white/80 border border-white/60 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-xl shrink-0 overflow-hidden">
                        <img src={resolveImage(item.img)} alt={item.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/p2.png" }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <p className="font-bold text-[#4b2e2e] text-sm">₱{(Number(item.price) || 0) * (Number(item.qty) || 1)}</p>
                  </div>
                ))}
              </div>

              {/* ORDER TOTALS */}
              <div className="bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span>
                </div>
                {deliveryType === "delivery" && (
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1.5"><Truck size={13} className="text-[#4b2e2e]" /> Shipping Fee</span>
                    <span>₱35</span>
                  </div>
                )}
                {deliveryType !== "delivery" && (
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Shipping Fee</span><span>Free</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3">
                  <span>Total</span><span className="text-[#4b2e2e]">₱{total.toLocaleString()}</span>
                </div>
              </div>

              {/* GCASH QR */}
              {isGcash && (
                <div className="bg-white border border-[#e8d5d5] rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
                  <p className="text-sm font-bold text-[#2a1515] mb-1">Scan to Pay via GCash</p>
                  <p className="text-xs text-gray-400 mb-4">Send payment then upload screenshot below</p>
                  <img src="/gcashqrcode.jpg" alt="GCash QR Code"
                    className="w-[200px] h-[200px] rounded-xl object-contain shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
              )}
            </div>

            {/* RIGHT — DELIVERY + PAYMENT + DETAILS */}
            <div className="space-y-4">

              {/* DELIVERY METHOD */}
              <div className="bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-3">Delivery Method</h2>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map(({ value, label, desc, icon: Icon, fee }) => (
                    <button key={value} type="button" onClick={() => handleDeliveryTypeChange(value)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition ${deliveryType === value ? "border-[#4b2e2e] bg-[#4b2e2e]/5" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${deliveryType === value ? "bg-[#4b2e2e] text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Icon size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${deliveryType === value ? "text-[#4b2e2e]" : "text-gray-700"}`}>{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${fee > 0 ? "text-[#4b2e2e]" : "text-green-600"}`}>
                        {fee > 0 ? `+₱${fee}` : "Free"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-3">Payment Method</h2>
                <div className="space-y-2">
                  {paymentOptions.map(({ value, icon: Icon }) => (
                    <button key={value} type="button" onClick={() => handlePaymentChange(value)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition ${paymentMethod === value ? "border-[#4b2e2e] bg-[#4b2e2e]/5" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${paymentMethod === value ? "bg-[#4b2e2e] text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Icon size={17} />
                      </div>
                      <span className={`text-sm font-semibold ${paymentMethod === value ? "text-[#4b2e2e]" : "text-gray-700"}`}>{value}</span>
                    </button>
                  ))}
                </div>

                {/* GCASH RECEIPT UPLOAD */}
                {isGcash && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Upload GCash Receipt <span className="text-red-400">*</span></p>
                    <label className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-2xl p-5 cursor-pointer transition ${errors.receipt ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-[#4b2e2e]"}`}>
                      {gcashPreview ? (
                        <img src={gcashPreview} alt="receipt" className="max-h-36 rounded-xl object-contain" />
                      ) : (
                        <>
                          <Upload size={22} className="text-gray-300" />
                          <p className="text-xs text-gray-400">Click to upload JPG or PNG</p>
                        </>
                      )}
                      <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleGcashUpload} className="hidden" />
                    </label>
                    {receiptError && <p className="text-xs text-red-500 mt-1">{receiptError}</p>}
                    {errors.receipt && !receiptError && <p className="text-xs text-red-500 mt-1">{errors.receipt}</p>}
                    {gcashFile && !errors.receipt && <p className="text-xs text-green-600 mt-1">✓ {gcashFile.name}</p>}
                  </div>
                )}
              </div>

              {/* DELIVERY DETAILS */}
              <div className="bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm space-y-3">
                <h2 className="font-semibold text-gray-700">
                  {deliveryType === "delivery" ? "Delivery Details" : deliveryType === "pickup" ? "Pick-up Info" : "Meet-up Details"}
                </h2>

                {deliveryType === "delivery" && (
                  <>
                    <Field label="Full Name" error={errors.fullName}>
                      <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name"
                        className={input(errors.fullName)} />
                    </Field>
                    <Field label="Phone Number" error={errors.phone}>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="09XXXXXXXXX" maxLength={11}
                        className={input(errors.phone)} />
                    </Field>
                    <Field label="Delivery Address" error={errors.address}>
                      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, Barangay, City"
                        className={input(errors.address)} />
                    </Field>
                  </>
                )}

                {deliveryType === "pickup" && (
                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <Store size={18} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-700">Pick up at store location</p>
                      <p className="text-xs text-amber-600 mt-0.5">No address needed. Pay upon arrival.</p>
                    </div>
                  </div>
                )}

                {deliveryType === "meetup" && (
                  <>
                    <Field label="Full Name" error={errors.fullName}>
                      <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name"
                        className={input(errors.fullName)} />
                    </Field>
                    <Field label="Meet-up Location" error={errors.address}>
                      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. SM City, Jollibee Rizal Ave"
                        className={input(errors.address)} />
                    </Field>
                    <Field label="Phone Number" error={errors.phone}>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="09XXXXXXXXX" maxLength={11}
                        className={input(errors.phone)} />
                    </Field>
                  </>
                )}

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={deliveryType === "delivery" ? "Delivery Date" : "Date"} error={errors.deliveryDate}>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input type="date" value={deliveryDate} min={today} onChange={e => setDeliveryDate(e.target.value)}
                        className={`${input(errors.deliveryDate)} pl-8`} />
                    </div>
                  </Field>
                  <Field label="Time Slot" error={errors.deliveryTime}>
                    <div className="relative">
                      <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <select value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)}
                        className={`${input(errors.deliveryTime)} pl-8 bg-white`}>
                        <option value="">Select time</option>
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </Field>
                </div>
              </div>

              <button onClick={placeOrder} disabled={submitting}
                className="w-full bg-[#4b2e2e] text-white py-4 rounded-full hover:bg-[#3a2323] transition font-bold text-sm shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? "Placing Order..." : `Place Order — ₱${total.toLocaleString()}`}
              </button>
            </div>

          </div>
        </main>
        <Footer />
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-[340px] shadow-xl">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#4b2e2e]/10`}>
              <selectedDelivery.icon size={22} className="text-[#4b2e2e]" />
            </div>
            <h2 className="text-base font-bold text-[#2a1515] text-center mb-1">{selectedDelivery.label} Selected</h2>
            <p className="text-sm text-gray-500 text-center mb-3">{DELIVERY_INFO[deliveryType].desc}</p>
            <div className="bg-[#fdf6f6] rounded-xl p-3 space-y-1.5 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className={`font-semibold ${shippingFee > 0 ? "text-[#4b2e2e]" : "text-green-600"}`}>
                  {shippingFee > 0 ? `₱${shippingFee}` : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Default Payment</span>
                <span className="font-semibold">{DELIVERY_INFO[deliveryType].defaultPayment}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mb-4">You can also choose GCash as payment.</p>
            <button onClick={() => setShowPopup(false)}
              className="w-full bg-[#4b2e2e] text-white py-2.5 rounded-full text-sm font-bold hover:bg-[#3a2323] transition">
              Got it!
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function input(error?: string) {
  return `w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4b2e2e] transition ${error ? "border-red-300 bg-red-50/30" : "border-gray-200"}`
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label} <span className="text-red-400">*</span></label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
