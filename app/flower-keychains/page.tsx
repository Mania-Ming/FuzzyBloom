"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import SmartNavbar from "@/components/SmartNavbar"
import Footer from "@/components/Footer"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import { useMe } from "@/lib/hooks/useMe"

type Product = { id: string; name: string; img: string }

const colors: Product[] = [
  { id: "b7ed3194-9a79-448a-aaba-c0c0af2a7ca9", name: "Pink", img: "/k1.png" },
  { id: "25252edd-2276-4d09-bff8-ddbe83bdd078", name: "Purple", img: "/k2.png" },
  { id: "3252c399-c743-4a2f-8b1f-e163c797fcfd", name: "White", img: "/k3.png" },
  { id: "af739689-0076-4dae-b5db-9d576e7ac181", name: "Yellow", img: "/k4.png" },
  { id: "f4adda5d-0b8a-49e4-91da-d81c887cb6d1", name: "Red", img: "/k5.png" },
  { id: "271971f8-2f13-43f3-a98b-1589a1d9b771", name: "Blue", img: "/k6.png" },
]

export default function FlowerKeychainsPage() {
  const [selected, setSelected] = useState<Product>(colors[0])
  const { isLoggedIn } = useAuth()
  const { data: user } = useMe()
  const router = useRouter()

  async function addToCart() {
    if (!isLoggedIn) { router.push("/login"); return }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const name = "Flower Keychain - " + selected.name
    const exist = cart.find((i: any) => i.name === name)
    if (exist) { exist.qty += 1 } else { cart.push({ product_id: selected.id, name, price: 25, img: selected.img, qty: 1 }) }
    localStorage.setItem("cart", JSON.stringify(cart))
    if (user?.id) {
      const { data: existing } = await supabase.from("cart_items").select("*").eq("user_id", user.id).eq("product_id", selected.id).single()
      if (existing) {
        await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id)
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, product_id: selected.id, quantity: 1 })
      }
    }
  }

  async function addToWishlist() {
    if (!isLoggedIn) { router.push("/login"); return }
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const name = "Flower Keychain - " + selected.name
    if (!wishlist.find((i: any) => i.name === name)) {
      wishlist.push({ name, price: 25, img: selected.img })
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }
    if (user?.id) {
      const { data: existing } = await supabase.from("wishlist").select("*").eq("user_id", user.id).eq("product_id", selected.id).single()
      if (!existing) {
        await supabase.from("wishlist").insert({ user_id: user.id, product_id: selected.id })
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      <SmartNavbar />
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-10 flex-1 w-full">

        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4b2e2e] transition mb-8 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* IMAGE */}
          <div className="bg-white/80 rounded-3xl border border-white/60 shadow-sm p-10 flex items-center justify-center aspect-square">
            <Image src={selected.img} alt="Flower Keychain" width={280} height={280} className="object-contain transition-all duration-300" />
          </div>

          {/* DETAILS */}
          <div className="py-2">
            <span className="text-xs font-semibold text-[#4b2e2e] bg-[#4b2e2e]/10 px-3 py-1 rounded-full uppercase tracking-wide">Keychains</span>
            <h1 className="text-3xl mt-3 mb-1 text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>Flower Keychains</h1>
            <p className="text-gray-500 text-sm mb-5">Choose your favorite flower color</p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-[#4b2e2e]">₱25</span>
              <span className="text-sm text-gray-400">per piece</span>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Color: <span className="text-[#4b2e2e]">{selected.name}</span>
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(c)}
                    className={`border-2 rounded-xl p-1.5 transition ${selected.name === c.name ? "border-[#4b2e2e] shadow-md" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <Image src={c.img} alt={c.name} width={56} height={56} className="object-contain rounded-lg" />
                  </button>
                ))}
              </div>
            </div>

            {!isLoggedIn && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
                <span>🔒</span> Login to add to cart or wishlist
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={addToWishlist}
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-full hover:border-pink-400 hover:text-pink-500 transition text-lg"
                title="Add to Wishlist"
              >
                ♡
              </button>
              <button
                onClick={addToCart}
                className="flex-1 bg-[#4b2e2e] text-white py-3 rounded-full hover:bg-[#3a2323] transition font-semibold text-sm shadow-md shadow-[#4b2e2e]/20"
              >
                {isLoggedIn ? "Add to Cart" : "Login to Purchase"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
