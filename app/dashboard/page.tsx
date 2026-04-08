"use client"

import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"

const categories = [
  { name: "Bouquets", icon: "🌸", link: "/bouquets", bg: "from-pink-100 to-rose-200" },
  { name: "Flower Keychains", icon: "🌼", link: "/flower-keychains", bg: "from-yellow-100 to-amber-200" },
  { name: "Ribbon Keychains", icon: "🎀", link: "/ribbon-keychains", bg: "from-purple-100 to-violet-200" },
  { name: "Headbands", icon: "👑", link: "/headbands", bg: "from-rose-100 to-pink-200" },
]

const products = [
  { name: "Lavender Grace", img: "/p1.png", price: 499 },
  { name: "Rose Romance", img: "/p2.png", price: 549 },
  { name: "Daisy Delight", img: "/p3.png", price: 449 },
  { name: "Pink Petal Keychain", img: "/p4.png", price: 129 },
]

export default function Dashboard() {

  function addToCart(product: any) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const exist = cart.find((i: any) => i.name === product.name)
    if (exist) { exist.qty += 1 } else { cart.push({ ...product, qty: 1 }) }
    localStorage.setItem("cart", JSON.stringify(cart))
  }

  function addToWishlist(product: any) {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    if (!wishlist.find((i: any) => i.name === product.name)) {
      wishlist.push(product)
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />

        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#e8d5e8] via-[#f0e0ec] to-[#ddd0dd]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex items-center justify-between gap-6">
            <div className="fade-up">
              <span className="inline-block text-xs font-semibold text-[#4b2e2e] bg-[#4b2e2e]/10 px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
                Handmade with Love
              </span>
              <h1 className="text-4xl mb-1 text-[#2a1515] leading-tight" style={{ fontFamily: "var(--font-pacifico)" }}>
                Fuzzy Bloom
              </h1>
              <p className="text-[#4b2e2e]/70 font-medium text-sm mb-1">Handicrafts by Kate</p>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed max-w-sm">
                Handmade floral crafts and decorative pieces inspired by nature, creativity, and the joy of meaningful gifts.
              </p>
              <Link href="/bouquets" className="inline-block bg-[#4b2e2e] text-white px-6 py-2.5 rounded-full hover:bg-[#3a2323] transition font-medium shadow-md shadow-[#4b2e2e]/20 text-sm">
                Shop Now
              </Link>
            </div>
            <div className="relative fade-up shrink-0">
              <div className="absolute inset-0 bg-[#4b2e2e]/10 rounded-full blur-2xl scale-110" />
              <Image src="/logo.jpg" alt="Fuzzy Bloom" width={150} height={150} className="relative rounded-full object-cover shadow-xl ring-4 ring-white/60" />
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-0.5">Browse our handcrafted collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.link}>
                <div className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 card-hover cursor-pointer h-36 border border-white/60`}>
                  <span className="text-4xl">{cat.icon}</span>
                  <p className="font-semibold text-sm text-center text-gray-700">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-pacifico)" }}>Hot Handicrafts</h2>
              <p className="text-gray-500 text-sm mt-0.5">Our most-loved pieces</p>
            </div>
            <Link href="/bouquets" className="text-sm text-[#4b2e2e] font-medium hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <div key={i} className="bg-white/80 rounded-2xl shadow-sm border border-white/60 p-4 card-hover flex flex-col">
                <div className="h-[170px] flex items-center justify-center bg-gray-50/50 rounded-xl mb-3">
                  <Image src={product.img} alt={product.name} width={150} height={150} className="object-contain w-full h-auto max-h-[150px]" />
                </div>
                <p className="font-semibold text-sm text-gray-800 flex-1">{product.name}</p>
                <p className="text-[#4b2e2e] font-bold mt-0.5 text-sm mb-3">₱{product.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addToWishlist(product)}
                    className="w-10 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:border-pink-400 hover:text-pink-500 transition text-base"
                    title="Add to Wishlist"
                  >
                    ♡
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-[#4b2e2e] text-white rounded-full py-2 text-xs font-semibold hover:bg-[#3a2323] transition"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
