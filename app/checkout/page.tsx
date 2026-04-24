"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useMe } from "@/lib/hooks/useMe"
import { useInsertOrder } from "@/lib/hooks/useInsertOrder"
import { supabase } from "@/lib/supabase"
import { insertDeliveryDetails } from "@/lib/api/auth"

type CartItem = { product_id: string; name: string; price: number; img?: string; qty: number }

const TIME_SLOTS = ["9:00 AM", "1:00 PM", "6:00 PM"]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: user } = useMe()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [payment, setPayment] = useState("cod")
  const [gcashProof, setGcashProof] = useState<File | null>(null)
  const [gcashPreview, setGcashPreview] = useState<string | null>(null)
  const [receiptError, setReceiptError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { mutateAsync: saveOrder } = useInsertOrder()
  const shipping = 20

  // Delivery form fields
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
    supabase
      .from("profiles")
      .select("address, contact_number, full_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAddress(data.address || "")
          setPhone(data.contact_number || "")
          setFullName(data.full_name || user.full_name || "")
        }
      })
  }, [user?.id])

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0)
  const total = subtotal + (cartItems.length > 0 ? shipping : 0)
  const today = new Date().toISOString().split("T")[0]

  function handleGcashUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setReceiptError("Only JPG and PNG files are accepted.")
      return
    }
    setReceiptError("")
    setGcashProof(file)
    setGcashPreview(URL.createObjectURL(file))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = "Full name is required."
    if (!phone.trim()) e.phone = "Phone number is required."
    else if (!/^09\d{9}$/.test(phone.trim())) e.phone = "Enter a valid 11-digit PH number (09XXXXXXXXX)."
    if (!address.trim()) e.address = "Delivery address is required."
    if (!deliveryDate) e.deliveryDate = "Delivery date is required."
    else if (deliveryDate < today) e.deliveryDate = "Delivery date cannot be in the past."
    if (!deliveryTime) e.deliveryTime = "Please select a delivery time slot."
    if (payment === "gcash" && !gcashProof) e.receipt = "Please upload your GCash payment receipt."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function placeOrder() {
    if (cartItems.length === 0) { alert("Cart is empty!"); return }
    if (!user?.id) { alert("You must be logged in to place an order."); return }
    if (!validate()) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { alert("Session expired. Please log in again."); router.push("/login"); return }

    setSubmitting(true)
    try {
      // 1. Upload GCash receipt if needed
      let receiptUrl: string | null = null
      if (payment === "gcash" && gcashProof) {
        const ext = gcashProof.name.split(".").pop() ?? "jpg"
        const filePath = `public/${user.id}_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, gcashProof, { cacheControl: "3600", upsert: true })
        if (uploadError) { alert("Failed to upload receipt: " + uploadError.message); return }
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(uploadData.path)
        receiptUrl = urlData.publicUrl
      }

      // 2. Insert into orders table (core fields only)
      const order = await saveOrder({
        user_id: user.id,
        items: cartItems,
        subtotal,
        shipping,
        total,
        total_amount: total,
        payment,
        status: "Pending",
        receipt_url: receiptUrl,
      })

      // 3. Insert delivery details into separate table
      await insertDeliveryDetails({
        order_id: order.id,
        full_name: fullName,
        phone,
        address,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
      })

      // 4. Insert order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.qty,
        price: item.price,
      }))
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw itemsError

      // 5. Clear cart
      localStorage.removeItem("cart")
      await supabase.from("cart_items").delete().eq("user_id", user.id)

      alert("Order placed successfully! 🎉")
      router.push("/orders")
    } catch (err: any) {
      alert("Failed to place order: " + (err?.message ?? "Unknown error."))
    } finally {
      setSubmitting(false)
    }
  }

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
                      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        <Image src={item.img || "/p2.png"} alt={item.name} width={52} height={52} className="rounded-lg object-cover" />
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

              {/* TOTALS */}
              <div className="bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₱{subtotal}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>₱{cartItems.length > 0 ? shipping : 0}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3">
                  <span>Total</span><span className="text-[#4b2e2e]">₱{total}</span>
                </div>
              </div>

              {/* GCASH QR */}
              {payment === "gcash" && (
                <div className="bg-white border border-[#e8d5d5] rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
                  <p className="text-sm font-bold text-[#2a1515] mb-1">Scan to Pay via GCash</p>
                  <p className="text-xs text-gray-400 mb-4">Send payment then upload screenshot below</p>
                  <Image src="/gcashqrcode.jpg" alt="GCash QR Code" width={250} height={250} className="rounded-xl object-contain shadow-sm" />
                </div>
              )}
            </div>

            {/* RIGHT — DELIVERY + PAYMENT */}
            <div className="space-y-4">

              {/* DELIVERY DETAILS */}
              <div className="bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm space-y-3">
                <h2 className="font-semibold text-gray-700">Delivery Details</h2>

                {/* Full Name */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name <span className="text-red-400">*</span></label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4b2e2e] transition ${errors.fullName ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Phone Number <span className="text-red-400">*</span></label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="09XXXXXXXXX"
                    maxLength={11}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4b2e2e] transition ${errors.phone ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Delivery Address <span className="text-red-400">*</span></label>
                  <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street, Barangay, City"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4b2e2e] transition ${errors.address ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Delivery Date <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={deliveryDate}
                      min={today}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4b2e2e] transition ${errors.deliveryDate ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}
                    />
                    {errors.deliveryDate && <p className="text-xs text-red-500 mt-1">{errors.deliveryDate}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Time Slot <span className="text-red-400">*</span></label>
                    <select
                      value={deliveryTime}
                      onChange={e => setDeliveryTime(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4b2e2e] bg-white transition ${errors.deliveryTime ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}
                    >
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.deliveryTime && <p className="text-xs text-red-500 mt-1">{errors.deliveryTime}</p>}
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-4">Payment Method</h2>
                <div className="space-y-2.5">
                  {[
                    { value: "cod", label: "Cash on Delivery", icon: "💵" },
                    { value: "gcash", label: "GCash", icon: "📱" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition ${payment === opt.value ? "border-[#4b2e2e] bg-[#4b2e2e]/5" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{opt.icon}</span>
                        <span className="font-medium text-sm text-gray-700">{opt.label}</span>
                      </div>
                      <input
                        type="radio"
                        checked={payment === opt.value}
                        onChange={() => { setPayment(opt.value); setReceiptError(""); setErrors(p => ({ ...p, receipt: "" })) }}
                        className="accent-[#4b2e2e]"
                      />
                    </label>
                  ))}
                </div>

                {/* GCASH RECEIPT UPLOAD */}
                {payment === "gcash" && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Upload GCash Receipt <span className="text-red-500">*</span>
                    </p>
                    <p className="text-xs text-gray-400 mb-2">Accepted: JPG, PNG only</p>
                    <label className={`block border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${errors.receipt ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-[#4b2e2e]"}`}>
                      {gcashPreview ? (
                        <img src={gcashPreview} alt="receipt preview" className="max-h-40 mx-auto rounded-xl object-contain" />
                      ) : (
                        <div className="text-gray-400 text-sm">
                          <p className="text-3xl mb-2">📎</p>
                          <p>Click to upload receipt</p>
                        </div>
                      )}
                      <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleGcashUpload} className="hidden" />
                    </label>
                    {receiptError && <p className="text-xs text-red-500 mt-1">{receiptError}</p>}
                    {errors.receipt && !receiptError && <p className="text-xs text-red-500 mt-1">{errors.receipt}</p>}
                    {gcashProof && !errors.receipt && <p className="text-xs text-green-600 mt-1">✓ Receipt uploaded: {gcashProof.name}</p>}
                  </div>
                )}
              </div>

              <button
                onClick={placeOrder}
                disabled={submitting}
                className="w-full bg-[#4b2e2e] text-white py-4 rounded-full hover:bg-[#3a2323] transition font-bold text-sm shadow-md shadow-[#4b2e2e]/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Placing Order..." : `Place Order — ₱${total}`}
              </button>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
