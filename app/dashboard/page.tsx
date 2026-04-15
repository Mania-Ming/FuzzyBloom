"use client"

import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"

const categories = [
  { name: "Bouquets", icon: <img src="/bouquet.jpg" alt="Bouquet" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }} />, link: "/bouquets", bg: "from-pink-100 to-rose-200" },
  { name: "Flower Keychains", icon: <img src="/flower.jpg" alt="Flower" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }} />, link: "/flower-keychains", bg: "from-yellow-100 to-amber-200" },
  { name: "Ribbon Keychains", icon: <img src="/ribbon.jpg" alt="Ribbon" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }} />, link: "/ribbon-keychains", bg: "from-purple-100 to-violet-200" },
  { name: "Headbands", icon: null, link: "/headbands", bg: "from-rose-100 to-pink-200" },
]

const products = [
  { name: "Lavender Grace", img: "/p1.png", price: 350 },
  { name: "Rose Romance", img: "/p2.png", price: 420 },
  { name: "Flower Keychain", img: "/k1.png", price: 25 },
  { name: "Ribbon Keychain", img: "/r1.png", price: 20 },
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

        {/* CATEGORIES */}
        <section className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-0.5">Browse our handcrafted collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 3).map((cat, i) => (
              <Link key={i} href={cat.link}>
                <div className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 card-hover cursor-pointer h-36 border border-white/60`}>
                  {cat.icon}
                  <p className="font-semibold text-sm text-center text-gray-700">{cat.name}</p>
                </div>
              </Link>
            ))}
            <Link href="/headbands">
              <div className="bg-gradient-to-br from-rose-100 to-pink-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 card-hover cursor-pointer h-36 border border-white/60">
                <img src="/headband.jpg" alt="Headband" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }} />
                <p className="font-semibold text-sm text-center text-gray-700">Headbands</p>
              </div>
            </Link>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-14">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-pacifico)" }}>Hot Handicrafts</h2>
            <p className="text-sm mt-0.5" style={{ color: "#3E2C2C" }}>Our most-loved pieces</p>
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
