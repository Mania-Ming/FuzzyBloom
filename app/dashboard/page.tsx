"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"

type Product = { id: string; name: string; price: number; img: string; category: string }

const categories = [
  { name: "Bouquets",          link: "/bouquets",          bg: "from-pink-100 to-rose-200",    icon: "/bouquet.png" },
  { name: "Flower Keychains",  link: "/flower-keychains",  bg: "from-yellow-100 to-amber-200", icon: "/flower.png" },
  { name: "Ribbon Keychains",  link: "/ribbon-keychains",  bg: "from-purple-100 to-violet-200",icon: "/ribbon.png" },
  { name: "Headbands",         link: "/headbands",         bg: "from-rose-100 to-pink-200",    icon: "/headband.png" },
]

export default function Dashboard() {
  const { data: user } = useMe()
  const [products, setProducts] = useState<Product[]>([])
  const [toast, setToast] = useState("")

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, price, image_url, category")
      .eq("is_available", true)
      .limit(8)
      .then(({ data }) => {
        setProducts(
          (data ?? []).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            img: p.image_url || "/p2.png",
            category: p.category,
          }))
        )
      })
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 2000)
  }

  async function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    // always dedup by product_id — never by name
    const exist = cart.find((i: any) => i.product_id === product.id)
    if (exist) { exist.qty += 1 } else {
      cart.push({ product_id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 })
    }
    localStorage.setItem("cart", JSON.stringify(cart))

    if (user?.id) {
      const { data: existing } = await supabase
        .from("cart_items").select("id, quantity")
        .eq("user_id", user.id).eq("product_id", product.id).single()
      if (existing) {
        await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id)
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 })
      }
    }
    showToast("Added to cart! 🛒")
  }

  function addToWishlist(product: Product) {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    if (!wishlist.find((i: any) => i.product_id === product.id)) {
      wishlist.push({ product_id: product.id, name: product.name, price: product.price, img: product.img })
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
      showToast("Added to wishlist! ♡")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#2a1515] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium fade-up">
            {toast}
          </div>
        )}

        {/* CATEGORIES */}
        <section className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-0.5">Browse our handcrafted collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.link}>
                <div className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 card-hover cursor-pointer h-36 border border-white/60`}>
                  <img src={cat.icon} alt={cat.name} className="w-10 h-10 object-contain rounded-lg" />
                  <p className="font-semibold text-sm text-center text-gray-700">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-14">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-pacifico)" }}>Hot Handicrafts</h2>
            <p className="text-sm mt-0.5" style={{ color: "#3E2C2C" }}>Our most-loved pieces</p>
          </div>

          {products.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.map((product) => (
                <div key={product.id} className="bg-white/80 rounded-2xl shadow-sm border border-white/60 p-4 card-hover flex flex-col">
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
          )}
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
