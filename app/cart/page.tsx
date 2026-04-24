"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"

type CartItem = { product_id: string; name: string; price: number; img?: string; qty: number }

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [validating, setValidating] = useState(true)
  const [removedNames, setRemovedNames] = useState<string[]>([])
  const router = useRouter()
  const { data: user } = useMe()
  const shipping = 20

  // Load cart and validate all product_ids against DB
  useEffect(() => {
    async function loadAndValidate() {
      const raw: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]")
      if (raw.length === 0) { setCartItems([]); setValidating(false); return }

      const ids = raw.map(i => i.product_id).filter(Boolean)
      if (ids.length === 0) {
        // all items missing product_id — clear everything
        localStorage.setItem("cart", "[]")
        setRemovedNames(raw.map(i => i.name))
        setCartItems([])
        setValidating(false)
        return
      }

      const { data: validProducts } = await supabase
        .from("products")
        .select("id")
        .in("id", ids)

      const validIds = new Set(validProducts?.map(p => p.id) ?? [])
      const valid = raw.filter(i => i.product_id && validIds.has(i.product_id))
      const removed = raw.filter(i => !i.product_id || !validIds.has(i.product_id))

      if (removed.length > 0) {
        setRemovedNames(removed.map(i => i.name))
        localStorage.setItem("cart", JSON.stringify(valid))
        // also clean from DB cart_items
        if (user?.id) {
          const removedIds = removed.map(i => i.product_id).filter(Boolean)
          if (removedIds.length > 0) {
            await supabase.from("cart_items").delete()
              .eq("user_id", user.id)
              .in("product_id", removedIds)
          }
        }
      }

      setCartItems(valid)
      setValidating(false)
    }
    loadAndValidate()
  }, [user?.id])

  function saveCart(updated: CartItem[]) {
    setCartItems(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
  }

  function increaseQty(i: number) { const u = [...cartItems]; u[i].qty += 1; saveCart(u) }
  function decreaseQty(i: number) { const u = [...cartItems]; if (u[i].qty > 1) u[i].qty -= 1; saveCart(u) }

  async function removeItem(i: number) {
    const u = [...cartItems]
    const removed = u.splice(i, 1)[0]
    saveCart(u)
    if (removed.product_id && user?.id) {
      await supabase.from("cart_items").delete()
        .eq("user_id", user.id)
        .eq("product_id", removed.product_id)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0)
  const total = subtotal + (cartItems.length > 0 ? shipping : 0)

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <main className="max-w-5xl mx-auto w-full px-6 md:px-12 py-10 flex-1">

          <h1 className="text-3xl text-[#2a1515] mb-6" style={{ fontFamily: "var(--font-pacifico)" }}>Shopping Cart</h1>

          {/* Removed items banner */}
          {removedNames.length > 0 && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
              <span className="text-lg mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Some items were removed because they are no longer available</p>
                <p className="text-xs text-amber-600 mt-0.5">{removedNames.join(", ")}</p>
              </div>
              <button onClick={() => setRemovedNames([])} className="ml-auto text-amber-400 hover:text-amber-600 text-lg leading-none">✕</button>
            </div>
          )}

          {validating ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ITEMS */}
              <div className="lg:col-span-2 space-y-3">
                {cartItems.length === 0 && (
                  <div className="text-center py-20 text-gray-400 bg-white/60 rounded-3xl border border-white/60">
                    <p className="text-5xl mb-4">🛒</p>
                    <p className="font-medium text-gray-500">Your cart is empty</p>
                    <Link href="/dashboard" className="text-[#4b2e2e] text-sm font-semibold mt-3 inline-block hover:underline">Continue Shopping →</Link>
                  </div>
                )}
                {cartItems.map((item, i) => (
                  <div key={item.product_id} className="bg-white/80 rounded-2xl border border-white/60 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <Image src={item.img || "/p2.png"} alt={item.name} width={72} height={72} className="rounded-lg object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                      <p className="text-[#4b2e2e] font-bold text-sm mt-0.5">₱{Number(item.price) || 0}</p>
                      <p className="text-xs text-gray-300 font-mono mt-0.5 truncate">ID: {item.product_id}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                        <button onClick={() => decreaseQty(i)} className="px-3 py-1.5 text-sm hover:bg-gray-50 transition font-medium">−</button>
                        <span className="px-3 text-sm font-semibold">{item.qty}</span>
                        <button onClick={() => increaseQty(i)} className="px-3 py-1.5 text-sm hover:bg-gray-50 transition font-medium">+</button>
                      </div>
                      <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 transition p-1" title="Remove">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* SUMMARY */}
              <div className="bg-white/80 rounded-2xl border border-white/60 shadow-sm p-6 h-fit space-y-4">
                <h2 className="font-bold text-lg text-gray-800">Order Summary</h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₱{subtotal}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span>₱{cartItems.length > 0 ? shipping : 0}</span></div>
                  <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3 mt-1">
                    <span>Total</span><span className="text-[#4b2e2e]">₱{total}</span>
                  </div>
                </div>
                <button
                  disabled={cartItems.length === 0}
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-[#4b2e2e] text-white py-3 rounded-full hover:bg-[#3a2323] transition font-semibold text-sm shadow-md shadow-[#4b2e2e]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                <Link href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-gray-600 transition">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
