"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"
import { ShoppingCart, Heart, ArrowRight } from "lucide-react"

type Product = { id: string; name: string; price: number; img: string; description: string }

const categories = [
  { name: "Bouquets",         link: "/bouquets",         bg: "from-pink-100 to-rose-200",     icon: "/bouquet.png" },
  { name: "Flower Keychains", link: "/flower-keychains", bg: "from-yellow-100 to-amber-200",  icon: "/flower.png" },
  { name: "Ribbon Keychains", link: "/ribbon-keychains", bg: "from-purple-100 to-violet-200", icon: "/ribbon.png" },
  { name: "Headbands",        link: "/headbands",        bg: "from-rose-100 to-pink-200",     icon: "/headband.png" },
]

export default function Dashboard() {
  const { data: user } = useMe()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, price, image_url, description")
      .eq("category", "Bouquets")
      .eq("is_available", true)
      .order("name")
      .then(({ data }) => {
        setProducts((data ?? []).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          img: p.image_url || "/p2.png",
          description: p.description || "",
        })))
        setLoading(false)
      })
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2000) }

  async function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const exist = cart.find((i: any) => i.product_id === product.id)
    if (exist) { exist.qty += 1 } else {
      cart.push({ product_id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    if (user?.id) {
      const { data: existing } = await supabase.from("cart_items").select("id, quantity")
        .eq("user_id", user.id).eq("product_id", product.id).single()
      if (existing) await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id)
      else await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 })
    }
    showToast("Added to cart!")
  }

  async function addToWishlist(product: Product) {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    if (!wishlist.find((i: any) => i.product_id === product.id)) {
      wishlist.push({ product_id: product.id, name: product.name, price: product.price, img: product.img })
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
      showToast("Added to wishlist!")
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
        <section className="max-w-[1100px] mx-auto w-full px-6 py-10">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-0.5">Browse our handcrafted collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.link}>
                <div className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 card-hover cursor-pointer h-32 border border-white/60`}>
                  <img src={cat.icon} alt={cat.name} className="w-9 h-9 object-contain" />
                  <p className="font-semibold text-sm text-center text-gray-700">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED BOUQUETS */}
        <section className="max-w-[1100px] mx-auto w-full px-6 pb-14">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: "var(--font-pacifico)" }}>
                Featured Bouquets
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Handcrafted with love, just for you</p>
            </div>
            <Link href="/bouquets" className="flex items-center gap-1 text-xs font-semibold text-[#4b2e2e] hover:underline">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white/60 rounded-2xl border border-white/60">
              <p className="text-gray-400 text-sm">No bouquets available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <div key={product.id} className="bg-white/90 rounded-2xl shadow-sm border border-white/70 p-4 card-hover flex flex-col">
                  <div className="h-[160px] flex items-center justify-center bg-gray-50/60 rounded-xl mb-3 overflow-hidden">
                    <Image
                      src={product.img}
                      alt={product.name}
                      width={140} height={140}
                      className="object-contain w-full h-auto max-h-[140px]"
                    />
                  </div>
                  <p className="font-semibold text-sm text-gray-800 leading-snug">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-gray-400 mt-0.5 flex-1 line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-[#4b2e2e] font-bold mt-2 text-sm mb-3">₱{product.price.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToWishlist(product)}
                      title="Add to Wishlist"
                      className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:border-pink-400 hover:text-pink-500 transition shrink-0"
                    >
                      <Heart size={14} />
                    </button>
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#4b2e2e] text-white rounded-xl py-2 text-xs font-semibold hover:bg-[#3a2323] transition"
                    >
                      <ShoppingCart size={13} /> Add to Cart
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
