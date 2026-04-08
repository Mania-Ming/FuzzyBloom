"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import SmartNavbar from "@/components/SmartNavbar"
import Footer from "@/components/Footer"
import { useAuth } from "@/lib/hooks/useAuth"

const products = [
  { name: "Lavender Grace", desc: "Soft pink pom-pom flowers, sweet & cute", price: 499, img: "/p1.png" },
  { name: "Ruby & Sky", desc: "Red and baby blue tulips, bold but balanced", price: 499, img: "/p2.png" },
  { name: "Mint Serenity", desc: "Mint green tulips, clean and modern look", price: 499, img: "/p3.png" },
  { name: "Baby Blue Bliss", desc: "Sky-blue flowers, fresh and minimalist", price: 499, img: "/p4.png" },
  { name: "Golden Sun", desc: "Yellow blossoms bright and cheerful bouquet", price: 499, img: "/p5.png" },
]

export default function BouquetsPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  function addToCart(product: any) {
    if (!isLoggedIn) { router.push("/login"); return }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const exist = cart.find((i: any) => i.name === product.name)
    if (exist) { exist.qty += 1 } else { cart.push({ ...product, qty: 1 }) }
    localStorage.setItem("cart", JSON.stringify(cart))
  }

  function addToWishlist(product: any) {
    if (!isLoggedIn) { router.push("/login"); return }
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    if (!wishlist.find((i: any) => i.name === product.name)) {
      wishlist.push(product)
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      <SmartNavbar />
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
              <div className="h-[160px] flex items-center justify-center bg-gray-50/50 rounded-xl mb-3">
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
