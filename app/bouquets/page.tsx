"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SmartNavbar from "@/components/SmartNavbar"
import Footer from "@/components/Footer"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import { useMe } from "@/lib/hooks/useMe"
import { MessageCircle, X } from "lucide-react"

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
  const [msgModal, setMsgModal] = useState<DBProduct | null>(null)
  const [msgText, setMsgText] = useState("")
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState("")

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, is_available, category")
        .eq("category", "Bouquets")
        .order("name")
      setProducts(data ?? [])
      setLoading(false)
    }
    load()

    // Realtime subscription
    const channel = supabase
      .channel("bouquets-products")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" }, (payload) => {
        setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

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

  async function sendMessage() {
    if (!isLoggedIn) { router.push("/login?redirect=/bouquets"); return }
    if (!msgText.trim() || !msgModal || !user?.id) return
    setSending(true)
    await supabase.from("messages").insert({
      sender_id: user.id,
      product_id: msgModal.id,
      message: msgText.trim(),
    })
    setSending(false)
    setMsgText("")
    setMsgModal(null)
    setToast("Message sent to seller!")
    setTimeout(() => setToast(""), 3000)
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

      {/* MESSAGE MODAL */}
      {msgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800">Message Seller</h2>
              <button onClick={() => setMsgModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-4">About: <span className="font-semibold text-gray-600">{msgModal.name}</span></p>
            <textarea
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Write your message to the seller..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setMsgModal(null)} className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={sendMessage} disabled={sending || !msgText.trim()}
                className="flex-1 py-2.5 rounded-full bg-[#4b2e2e] text-white text-sm font-semibold hover:bg-[#3a2323] transition disabled:opacity-60">
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {products.map((product) => (
              <div key={product.id} className={`bg-white/80 rounded-2xl shadow-sm border border-white/60 p-4 flex flex-col relative transition-all duration-200 ${!product.is_available ? "opacity-60" : "card-hover"}`}>

                {/* SOLD OUT BADGE */}
                {!product.is_available && (
                  <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Sold Out</span>
                )}

                <div className="h-[160px] flex items-center justify-center bg-gray-50/50 rounded-xl mb-3 cursor-zoom-in"
                  onClick={() => setZoomedImg({ src: product.image_url || "/p1.png", name: product.name })}>
                  <Image src={product.image_url || "/p1.png"} alt={product.name} width={140} height={140} className="object-contain w-full h-auto max-h-[140px]" />
                </div>

                <h3 className="font-semibold text-sm text-gray-800">{product.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5 flex-1">{product.description}</p>
                <p className="text-[#4b2e2e] font-bold mt-2 text-sm mb-2">₱{product.price}</p>

                <div className="flex gap-1.5 mb-1.5">
                  <button onClick={() => addToWishlist(product)} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:border-pink-400 hover:text-pink-500 transition text-sm">♡</button>
                  <button onClick={() => addToCart(product)} disabled={!product.is_available}
                    className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${product.is_available ? "bg-[#4b2e2e] text-white hover:bg-[#3a2323]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                    {product.is_available ? "+ Cart" : "Not Available"}
                  </button>
                </div>

                {isLoggedIn && (
                  <button onClick={() => setMsgModal(product)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-full border border-gray-200 text-xs text-gray-500 hover:border-[#4b2e2e] hover:text-[#4b2e2e] transition">
                    <MessageCircle size={11} /> Message Seller
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
