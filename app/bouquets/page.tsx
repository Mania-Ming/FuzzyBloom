"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import SmartNavbar from "@/components/SmartNavbar"
import Footer from "@/components/Footer"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import { useMe } from "@/lib/hooks/useMe"

const products = [
  { id: "393d5726-d16e-425e-87b4-0a42659ee327", name: "Lavender Grace", desc: "Soft pink pom-pom flowers, sweet & cute", price: 350, img: "/p1.png" },
  { id: "6f71f609-c714-491f-ac3f-07803559262b", name: "Ruby & Sky", desc: "Red and baby blue tulips, bold but balanced", price: 350, img: "/p2.png" },
  { id: "3673fa44-8a97-4f6b-86a1-d59c395ac4b3", name: "Mint Serenity", desc: "Mint green tulips, clean and modern look", price: 380, img: "/p3.png" },
  { id: "54393891-a19e-40f4-a0a0-b9797d9268f1", name: "Baby Blue Bliss", desc: "Sky-blue flowers, fresh and minimalist", price: 280, img: "/p4.png" },
  { id: "3d5a12e9-db15-4d73-8cc3-32327f0a3145", name: "Golden Sun", desc: "Yellow blossoms bright and cheerful bouquet", price: 280, img: "/p5.png" },
]

export default function BouquetsPage() {
  const { isLoggedIn } = useAuth()
  const { data: user } = useMe()
  const router = useRouter()
  const [zoomedImg, setZoomedImg] = useState<{ src: string; name: string } | null>(null)

  async function addToCart(product: any) {
    if (!isLoggedIn) { router.push("/login"); return }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const exist = cart.find((i: any) => i.name === product.name)
    if (exist) { exist.qty += 1 } else { cart.push({ product_id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 }) }
    localStorage.setItem("cart", JSON.stringify(cart))
    if (user?.id) {
      const { data: existing } = await supabase.from("cart_items").select("*").eq("user_id", user.id).eq("product_id", product.id).single()
      if (existing) {
        await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id)
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 })
      }
    }
  }

  async function addToWishlist(product: any) {
    if (!isLoggedIn) { router.push("/login"); return }
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    if (!wishlist.find((i: any) => i.name === product.name)) {
      wishlist.push(product)
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }
    if (user?.id) {
      const { data: existing } = await supabase.from("wishlist").select("*").eq("user_id", user.id).eq("product_id", product.id).single()
      if (!existing) {
        await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id })
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      <SmartNavbar />

      {/* ZOOM MODAL */}
      {zoomedImg && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "80px", paddingBottom: "80px", zIndex: 9999, overflowY: "auto", background: "rgba(0,0,0,0.7)" }}
          onClick={() => setZoomedImg(null)}
        >
          <div
            style={{ position: "relative", maxHeight: "calc(100vh - 160px)", maxWidth: "400px", width: "90vw", overflow: "hidden", borderRadius: "16px", background: "white", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* X BUTTON */}
            <button
              onClick={() => setZoomedImg(null)}
              style={{ position: "absolute", top: "10px", right: "10px", width: "32px", height: "32px", borderRadius: "50%", background: "white", border: "1.5px solid #ccc", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
            >
              ×
            </button>
            <img
              src={zoomedImg.src}
              alt={zoomedImg.name}
              style={{ width: "100%", height: "auto", maxHeight: "calc(100vh - 220px)", objectFit: "contain", borderRadius: "8px", display: "block" }}
            />
            <p style={{ fontWeight: 600, fontSize: "14px", color: "#2a1515", textAlign: "center" }}>{zoomedImg.name}</p>
            <button
              onClick={() => setZoomedImg(null)}
              style={{ width: "100%", padding: "8px", borderRadius: "999px", border: "1px solid #e5e7eb", fontSize: "13px", color: "#6b7280", background: "white", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex-1 w-full">

        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4b2e2e] transition mb-6 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>Bouquets</h1>
          <p className="text-gray-500 text-sm mt-1">Handmade floral bouquets crafted with love.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.map((product, i) => (
            <div key={i} className="bg-white/80 rounded-2xl shadow-sm border border-white/60 p-4 card-hover flex flex-col">
              <div
                className="h-[160px] flex items-center justify-center bg-gray-50/50 rounded-xl mb-3 cursor-zoom-in"
                onClick={() => setZoomedImg({ src: product.img, name: product.name })}
              >
                <Image src={product.img} alt={product.name} width={140} height={140} className="object-contain w-full h-auto max-h-[140px]" />
              </div>
              <h3 className="font-semibold text-sm text-gray-800">{product.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 flex-1">{product.desc}</p>
              <p className="text-[#4b2e2e] font-bold mt-2 text-sm mb-3">₱{product.price}</p>
              <div className="flex gap-2">
                <button onClick={() => addToWishlist(product)} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:border-pink-400 hover:text-pink-500 transition text-sm">♡</button>
                <button onClick={() => addToCart(product)} className="flex-1 bg-[#4b2e2e] text-white rounded-full py-2 text-xs font-semibold hover:bg-[#3a2323] transition">+ Cart</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
