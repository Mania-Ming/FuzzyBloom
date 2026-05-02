"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import SmartNavbar from "@/components/SmartNavbar"
import Footer from "@/components/Footer"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import { useMe } from "@/lib/hooks/useMe"
import { Heart, ChevronRight, MessageCircle } from "lucide-react"
import { ContactModalDialog } from "@/components/ContactModal"

function resolveImage(src: string | null | undefined, fallback = "/p1.png"): string {
  if (!src) return fallback
  if (src.startsWith("http")) return src
  return src.startsWith("/") ? src : `/${src}`
}

type DBProduct = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  category: string
}

export default function BouquetsPage() {
  const { isLoggedIn } = useAuth()
  const { data: user } = useMe()
  const router = useRouter()
  const [products, setProducts] = useState<DBProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [zoomedImg, setZoomedImg] = useState<{ src: string; name: string } | null>(null)
  const [contactProduct, setContactProduct] = useState<string | null>(null)
  const [toast, setToast] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const PER_PAGE = 6

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, image_url, is_available, category")
      .order("name")

    console.log("RAW:", data)
    console.log("ERROR:", error)

    const filtered = (data ?? []).filter((p) =>
      p.category?.toLowerCase().includes("bouquet")
    )

    const normalized = filtered.map((p) => ({
      ...p,
      image_url: p.image_url || "/p1.png",
      is_available: p.is_available !== false,
    }))

    setProducts(normalized)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
    // Realtime: handle INSERT, UPDATE, DELETE so admin changes reflect instantly
    const channel = supabase
      .channel("bouquets-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, fetchProducts)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchProducts])

  async function addToCart(product: DBProduct) {
    if (!isLoggedIn) { router.push("/login"); return }
    if (!product.is_available) { alert("This product is already sold out."); return }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const exist = cart.find((i: any) => i.product_id === product.id)
    if (exist) { exist.qty += 1 } else { cart.push({ product_id: product.id, name: product.name, price: product.price, img: product.image_url, qty: 1 }) }
    localStorage.setItem("cart", JSON.stringify(cart))
    if (user?.id) {
      const { data: existing } = await supabase.from("cart_items").select("*").eq("user_id", user.id).eq("product_id", product.id).single()
      if (existing) { await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id) }
      else { await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 }) }
    }
    setToast("Added to cart!")
    setTimeout(() => setToast(""), 2000)
  }

  async function addToWishlist(product: DBProduct) {
    if (!isLoggedIn) { router.push("/login"); return }
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    if (!wishlist.find((i: any) => i.product_id === product.id)) {
      wishlist.push({ product_id: product.id, name: product.name, price: product.price, img: product.image_url })
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }
    if (user?.id) {
      const { data: existing } = await supabase.from("wishlist").select("*").eq("user_id", user.id).eq("product_id", product.id).single()
      if (!existing) { await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id }) }
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      <SmartNavbar />

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2a1515] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium fade-up">
          {toast}
        </div>
      )}

      {/* ZOOM MODAL */}
      {zoomedImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setZoomedImg(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <img src={zoomedImg.src} alt={zoomedImg.name} className="w-full h-auto max-h-72 object-contain rounded-xl" />
            <p className="font-semibold text-sm text-[#2a1515]">{zoomedImg.name}</p>
            <button onClick={() => setZoomedImg(null)} className="w-full py-2 rounded-full border border-gray-200 text-sm text-gray-500">Close</button>
          </div>
        </div>
      )}



      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex-1 w-full">
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm hover:text-[#4b2e2e] transition mb-6 group" style={{ color: "#3E2C2C" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>Bouquets</h1>
          <p className="text-sm mt-1" style={{ color: "#3E2C2C" }}>Handmade floral bouquets crafted with love.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">🌸</p>
            <p className="text-gray-500 font-medium">No bouquets available right now.</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon or contact the seller.</p>
          </div>
        ) : (
          <>
            {/* Carousel with next arrow */}
            <div className="relative">
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
              <div ref={scrollRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-3 pr-12 no-scrollbar">
                {products.slice(page * PER_PAGE, (page + 1) * PER_PAGE).map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white/80 rounded-2xl shadow-sm border border-white/60 p-4 flex flex-col relative transition-all duration-200 shrink-0 ${
                      !product.is_available ? "opacity-60" : "card-hover"
                    }`}
                    style={{ width: "200px" }}
                  >
                    {!product.is_available && (
                      <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Sold Out</span>
                    )}
                    {/* Chat icon — top-right overlay */}
                    <button
                      onClick={e => { e.stopPropagation(); setContactProduct(product.name) }}
                      title="Contact Seller"
                      className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-gray-400 hover:text-[#4b2e2e] hover:scale-110 transition"
                    >
                      <MessageCircle size={13} />
                    </button>
                    <div
                      className="h-[160px] flex items-center justify-center bg-gray-50/50 rounded-xl mb-3 cursor-zoom-in overflow-hidden"
                      onClick={() => setZoomedImg({ src: resolveImage(product.image_url), name: product.name })}
                    >
                      <img
                        src={resolveImage(product.image_url)}
                        alt={product.name}
                        className="object-contain w-full h-full max-h-[140px]"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/p1.png" }}
                      />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex-1 line-clamp-2">{product.description}</p>
                    <p className="text-[#4b2e2e] font-bold mt-2 text-sm mb-2">₱{product.price.toLocaleString()}</p>
                    <div className="flex gap-1.5 mb-1.5">
                      <button onClick={() => addToWishlist(product)} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:border-pink-400 hover:text-pink-500 transition">
                        <Heart size={13} />
                      </button>
                      <button onClick={() => addToCart(product)} disabled={!product.is_available}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${product.is_available ? "bg-[#4b2e2e] text-white hover:bg-[#3a2323]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                        {product.is_available ? "+ Cart" : "Not Available"}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {products.length > PER_PAGE && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => { setPage(p => Math.max(0, p - 1)); scrollRef.current?.scrollTo({ left: 0 }) }}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  Page {page + 1} of {Math.ceil(products.length / PER_PAGE)}
                </span>
                <button
                  onClick={() => { setPage(p => Math.min(Math.ceil(products.length / PER_PAGE) - 1, p + 1)); scrollRef.current?.scrollTo({ left: 0 }) }}
                  disabled={page >= Math.ceil(products.length / PER_PAGE) - 1}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            )}
            <ContactModalDialog
              open={contactProduct !== null}
              onClose={() => setContactProduct(null)}
              productName={contactProduct ?? ""}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
