"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([])
  const { data: user } = useMe()

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from("wishlist")
      .select("*, products(*)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const items = data.map((item: any) => ({
            product_id: item.product_id,
            name: item.products?.name ?? "",
            price: item.products?.price ?? 0,
            img: item.products?.image_url ?? "",
          }))
          setWishlist(items)
          localStorage.setItem("wishlist", JSON.stringify(items))
        } else {
          // fallback to localStorage if Supabase returns empty
          try { setWishlist(JSON.parse(localStorage.getItem("wishlist") || "[]")) }
          catch { setWishlist([]) }
        }
      })
  }, [user?.id])

  async function removeItem(i: number) {
    const item = wishlist[i]
    const updated = wishlist.filter((_, idx) => idx !== i)
    setWishlist(updated)
    localStorage.setItem("wishlist", JSON.stringify(updated))
    if (user?.id && item.product_id) {
      await supabase.from("wishlist").delete()
        .eq("user_id", user.id)
        .eq("product_id", item.product_id)
    }
  }

  function addToCart(item: any) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const exist = cart.find((c: any) => c.name === item.name)
    if (!exist) { cart.push({ ...item, qty: 1 }); localStorage.setItem("cart", JSON.stringify(cart)) }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <main className="max-w-4xl mx-auto w-full px-6 md:px-12 py-10 flex-1">

          <div className="mb-8">
            <h1 className="text-3xl text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>Wishlist</h1>
            <p className="text-gray-500 text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
          </div>

          {wishlist.length === 0 && (
            <div className="text-center py-24 text-gray-400 bg-white/60 rounded-3xl border border-white/60">
              <p className="text-5xl mb-4">♡</p>
              <p className="font-medium text-gray-500">Your wishlist is empty</p>
              <Link href="/dashboard" className="text-[#4b2e2e] text-sm font-semibold mt-3 inline-block hover:underline">Browse Products →</Link>
            </div>
          )}

          <div className="space-y-3">
            {wishlist.map((item, i) => (
              <div key={i} className="bg-white/80 rounded-2xl border border-white/60 shadow-sm p-4 flex items-center gap-4 flex-wrap">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <Image src={item.img || "/logo.jpg"} alt={item.name} width={56} height={56} className="rounded-lg object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                  <p className="text-[#4b2e2e] font-bold text-sm mt-0.5">₱{Number(item.price) || 0}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-[#4b2e2e] text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#3a2323] transition"
                  >
                    + Add to Cart
                  </button>
                  <button
                    onClick={() => removeItem(i)}
                    className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 transition"
                    title="Remove"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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
