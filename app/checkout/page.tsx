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

type CartItem = { name: string; price: number; img?: string; qty: number }

export default function CheckoutPage() {
  const router = useRouter()
  const { data: user } = useMe()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [payment, setPayment] = useState("cod")
  const [gcashProof, setGcashProof] = useState<File | null>(null)
  const [gcashPreview, setGcashPreview] = useState<string | null>(null)
  const { mutateAsync: saveOrder } = useInsertOrder()
  const shipping = 20

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem("cart") || "[]"))
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0)
  const total = subtotal + (cartItems.length > 0 ? shipping : 0)

  function handleGcashUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) { setGcashProof(file); setGcashPreview(URL.createObjectURL(file)) }
  }

  async function placeOrder() {
    if (cartItems.length === 0) { alert("Cart is empty!"); return }
    if (payment === "gcash" && !gcashProof) { alert("Please upload GCash proof of payment."); return }
    if (!user?.id) return

    if (payment === "gcash" && gcashProof) {
      const fileName = `gcash/${user.id}_${Date.now()}`
      await supabase.storage.from("proofs").upload(fileName, gcashProof)
    }

    await saveOrder({
      user_id: user.id,
      items: cartItems,
      subtotal,
      shipping,
      total,
      payment,
      status: "Pending",
    })

    localStorage.removeItem("cart")
    alert("Order placed successfully! 🎉")
    router.push("/orders")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <main className="max-w-5xl mx-auto w-full px-6 md:px-12 py-10 flex-1">

          <h1 className="text-3xl text-[#2a1515] mb-8" style={{ fontFamily: "var(--font-pacifico)" }}>Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* LEFT — ORDER ITEMS */}
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
            </div>

            {/* RIGHT — PAYMENT */}
            <div className="space-y-4">

              {/* BUYER INFO */}
              <div className="bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-3">Buyer Information</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{user?.full_name ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{user?.email ?? "—"}</span>
                  </div>
                </div>
                <Link href="/profile" className="text-xs text-[#4b2e2e] font-medium hover:underline mt-3 inline-block">Edit in Profile →</Link>
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
                      <input type="radio" checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="accent-[#4b2e2e]" />
                    </label>
                  ))}
                </div>

                {payment === "gcash" && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Upload Proof of Payment</p>
                    <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-[#4b2e2e] transition">
                      {gcashPreview ? (
                        <img src={gcashPreview} alt="proof" className="max-h-40 mx-auto rounded-xl object-contain" />
                      ) : (
                        <div className="text-gray-400 text-sm">
                          <p className="text-3xl mb-2">📎</p>
                          <p>Click to upload screenshot</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleGcashUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              <button
                onClick={placeOrder}
                className="w-full bg-[#4b2e2e] text-white py-4 rounded-full hover:bg-[#3a2323] transition font-bold text-sm shadow-md shadow-[#4b2e2e]/20"
              >
                Place Order — ₱{total}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
