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

type Product = { id: string; name: string; img: string }

const colors: Product[] = [
  { id: "750356a4-5397-4225-ba9c-cfb6de48cce4", name: "Pink", img: "/r1.png" },
  { id: "51a7f03d-8747-4a62-93c0-6f45d687e321", name: "Purple", img: "/r2.png" },
  { id: "0b229c48-2cda-4e27-b0b2-e2aadbd06d6d", name: "White", img: "/r3.png" },
  { id: "81eac360-8c62-44ec-a335-5d2e7995a73e", name: "Yellow", img: "/r4.png" },
  { id: "1815aee6-c967-43a4-a243-197936547929", name: "Red", img: "/r5.png" },
]

export default function RibbonKeychainsPage() {
  const [selected, setSelected] = useState<Product>(colors[0])
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const { isLoggedIn } = useAuth()
  const { data: user } = useMe()
  const router = useRouter()
  const [msgText, setMsgText] = useState("")
  const [showMsg, setShowMsg] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState("")

  useEffect(() => {
    async function load() {
      const ids = colors.map(c => c.id)
      const { data } = await supabase.from("products").select("id, is_available").in("id", ids)
      const map: Record<string, boolean> = {}
      data?.forEach(p => { map[p.id] = p.is_available })
      setAvailability(map)
    }
    load()
    const channel = supabase.channel("ribbon-products")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" }, (payload) => {
        setAvailability(prev => ({ ...prev, [payload.new.id]: payload.new.is_available }))
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const isAvailable = availability[selected.id] !== false

  async function addToCart() {
    if (!isLoggedIn) { router.push("/login"); return }
    if (!isAvailable) { alert("This product is already sold out."); return }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const name = "Ribbon Keychain - " + selected.name
    const exist = cart.find((i: any) => i.product_id === selected.id)
    if (exist) { exist.qty += 1 } else { cart.push({ product_id: selected.id, name, price: 20, img: selected.img, qty: 1 }) }
    localStorage.setItem("cart", JSON.stringify(cart))
    if (user?.id) {
      const { data: existing } = await supabase.from("cart_items").select("*").eq("user_id", user.id).eq("product_id", selected.id).single()
      if (existing) { await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id) }
      else { await supabase.from("cart_items").insert({ user_id: user.id, product_id: selected.id, quantity: 1 }) }
    }
    setToast("Added to cart!"); setTimeout(() => setToast(""), 2000)
  }

  async function addToWishlist() {
    if (!isLoggedIn) { router.push("/login"); return }
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const name = "Ribbon Keychain - " + selected.name
    if (!wishlist.find((i: any) => i.product_id === selected.id)) {
      wishlist.push({ product_id: selected.id, name, price: 20, img: selected.img })
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }
    if (user?.id) {
      const { data: existing } = await supabase.from("wishlist").select("*").eq("user_id", user.id).eq("product_id", selected.id).single()
      if (!existing) { await supabase.from("wishlist").insert({ user_id: user.id, product_id: selected.id }) }
    }
  }

  async function sendMessage() {
    if (!msgText.trim() || !user?.id) return
    setSending(true)
    await supabase.from("messages").insert({ sender_id: user.id, product_id: selected.id, message: msgText.trim() })
    setSending(false); setMsgText(""); setShowMsg(false)
    setToast("Message sent!"); setTimeout(() => setToast(""), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      <SmartNavbar />
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-[#2a1515] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium fade-up">{toast}</div>}
      {showMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800">Message Seller</h2>
              <button onClick={() => setShowMsg(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-4">About: <span className="font-semibold text-gray-600">Ribbon Keychain - {selected.name}</span></p>
            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Write your message..." rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowMsg(false)} className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={sendMessage} disabled={sending || !msgText.trim()}
                className="flex-1 py-2.5 rounded-full bg-[#4b2e2e] text-white text-sm font-semibold hover:bg-[#3a2323] transition disabled:opacity-60">
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-10 flex-1 w-full">
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm hover:text-[#4b2e2e] transition mb-8 group" style={{ color: "#3E2C2C" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className={`bg-white/80 rounded-3xl border border-white/60 shadow-sm p-10 flex items-center justify-center aspect-square relative ${!isAvailable ? "opacity-60" : ""}`}>
            {!isAvailable && <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Sold Out</span>}
            <Image src={selected.img} alt="Ribbon Keychain" width={280} height={280} className="object-contain transition-all duration-300" />
          </div>
          <div className="py-2">
            <span className="text-xs font-semibold text-[#4b2e2e] bg-[#4b2e2e]/10 px-3 py-1 rounded-full uppercase tracking-wide">Keychains</span>
            <h1 className="text-3xl mt-3 mb-1 text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>Ribbon Keychains</h1>
            <p className="text-gray-500 text-sm mb-5">Pearl Bow Keychain – Handmade fluffy ribbon keychain with pearl center.</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-[#4b2e2e]">₱20</span>
              <span className="text-sm" style={{ color: "#3E2C2C" }}>per piece</span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Color: <span className="text-[#4b2e2e]">{selected.name}</span></p>
              <div className="flex gap-2.5 flex-wrap">
                {colors.map((c) => (
                  <button key={c.id} onClick={() => setSelected(c)}
                    className={`border-2 rounded-xl p-1.5 transition relative ${selected.name === c.name ? "border-[#4b2e2e] shadow-md" : "border-gray-200 hover:border-gray-300"}`}>
                    {availability[c.id] === false && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />}
                    <Image src={c.img} alt={c.name} width={56} height={56} className="object-contain rounded-lg" />
                  </button>
                ))}
              </div>
            </div>
            {!isLoggedIn && <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 mb-4 flex items-center gap-2"><span>🔒</span> Login to add to cart or wishlist</p>}
            <div className="flex gap-3 mb-3">
              <button onClick={addToWishlist} className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-full hover:border-pink-400 hover:text-pink-500 transition text-lg">♡</button>
              <button onClick={addToCart} disabled={!isAvailable}
                className={`flex-1 py-3 rounded-full font-semibold text-sm transition ${isAvailable ? "bg-[#4b2e2e] text-white hover:bg-[#3a2323] shadow-md shadow-[#4b2e2e]/20" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                {!isLoggedIn ? "Login to Purchase" : isAvailable ? "Add to Cart" : "Not Available"}
              </button>
            </div>
            {isLoggedIn && (
              <button onClick={() => setShowMsg(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-gray-200 text-sm text-gray-500 hover:border-[#4b2e2e] hover:text-[#4b2e2e] transition">
                <MessageCircle size={14} /> Message Seller
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
