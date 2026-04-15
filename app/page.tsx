"use client"

import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/Footer"
import { useState, useEffect } from "react"

const products = [
  { name: "Lavender Grace", img: "/p1.png", price: 350 },
  { name: "Rose Romance", img: "/p2.png", price: 420 },
  { name: "Flower Keychain", img: "/k1.png", price: 25 },
  { name: "Ribbon Keychain", img: "/r1.png", price: 20 },
]

const categories = [
  { name: "Bouquet", link: "/bouquets", bg: "#fce4ec", icon: <img src="/bouquet.png" alt="Bouquet" style={{ width: 22, height: 22, objectFit: "contain" as const }} /> },
  { name: "Flower", link: "/flower-keychains", bg: "#f3e5f5", icon: <img src="/flower.png" alt="Flower" style={{ width: 22, height: 22, objectFit: "contain" as const }} /> },
  { name: "Ribbon", link: "/ribbon-keychains", bg: "#fff3e0", icon: <img src="/ribbon.png" alt="Ribbon" style={{ width: 22, height: 22, objectFit: "contain" as const }} /> },
  { name: "Headband", link: "/headbands", bg: "#e8f5e9", icon: <img src="/headband.png" alt="Headband" style={{ width: 22, height: 22, objectFit: "contain" as const }} /> },
]

const carouselImages = ["/p1.png", "/p2.png", "/p3.png", "/p4.png", "/p5.png"]

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  function nextSlide() { setCurrentIndex((prev) => (prev + 1) % carouselImages.length) }
  function prevSlide() { setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length) }

  return (
    <div className="min-h-screen flex flex-col text-gray-800 scroll-smooth">

      {/* NAVBAR */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/logo.jpg" alt="logo" width={42} height={42} className="rounded-full object-cover" style={{ border: "2px solid rgba(75,46,46,0.15)" }} />
          <span style={{ fontWeight: 700, color: "#4b2e2e", fontSize: 16, letterSpacing: "0.03em" }}>Fuzzy Bloom</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/login" style={{ padding: "8px 20px", fontSize: 14, fontWeight: 500, color: "#555", borderRadius: 8, transition: "color 0.2s" }}
            className="hover:text-[#4b2e2e]">
            Login
          </Link>
          <Link href="/register" style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600, color: "white", background: "#4b2e2e", borderRadius: 999, boxShadow: "0 4px 12px rgba(75,46,46,0.25)", transition: "background 0.2s" }}
            className="hover:bg-[#3a2323]">
            Register
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "80vh", position: "relative", display: "flex", alignItems: "center" }} className="w-full">

        {/* OVERLAY */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.80) 40%, rgba(255,255,255,0.25) 70%, rgba(255,255,255,0.05) 100%)" }} />

        {/* CONTENT */}
        <div style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 60px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: 48,
        }}>

          {/* LEFT */}
          <div style={{ maxWidth: 500 }}>

            <p style={{ fontSize: 11, fontWeight: 700, color: "#b06080", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
              ✦ Handmade with Love
            </p>

            <h1 style={{ fontFamily: "var(--font-pacifico)", fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "#2a1515", lineHeight: 1.2, marginBottom: 14 }}>
              Fuzzy Bloom
            </h1>

            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 24, maxWidth: 420 }}>
              Handmade floral crafts and decorative pieces inspired by nature, creativity, and the joy of meaningful gifts.
            </p>

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginBottom: 20 }}>
              <Link href="/login" style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, color: "white", background: "#4b2e2e", borderRadius: 999, boxShadow: "0 6px 16px rgba(75,46,46,0.25)", transition: "background 0.2s" }}
                className="hover:bg-[#3a2323]">
                Shop Now
              </Link>
              <Link href="/about" style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, color: "#4b2e2e", border: "2px solid rgba(75,46,46,0.35)", borderRadius: 999, transition: "all 0.2s" }}
                className="hover:bg-[#4b2e2e] hover:text-white">
                About Us
              </Link>
            </div>

            {/* CATEGORY PILLS */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20, marginBottom: 16 }}>
              {categories.map((cat, i) => (
                <Link key={i} href={cat.link}>
                  <div style={{
                    backgroundColor: cat.bg,
                    borderRadius: 20,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    border: "1px solid rgba(255,255,255,0.8)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                    className="hover:-translate-y-1 hover:shadow-md"
                  >
                    <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{cat.icon}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#444" }}>{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>Made with love in the Philippines 🇵🇭</p>
          </div>

          {/* RIGHT — GLASS CAROUSEL */}
          <div style={{
            width: "100%",
            maxWidth: 420,
            height: 420,
            marginLeft: "auto",
            borderRadius: 20,
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <img
              src={carouselImages[currentIndex]}
              alt="product"
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 20, transition: "opacity 0.4s ease" }}
            />

            {/* PREV */}
            <button onClick={prevSlide} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", background: "white", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "transform 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}>←</button>

            {/* NEXT */}
            <button onClick={nextSlide} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", background: "white", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "transform 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}>→</button>

            {/* DOTS */}
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>
              {carouselImages.map((_, i) => (
                <button key={i} onClick={() => setCurrentIndex(i)} style={{ width: i === currentIndex ? 20 : 8, height: 8, borderRadius: 4, background: i === currentIndex ? "#4b2e2e" : "rgba(255,255,255,0.7)", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* HOT HANDICRAFTS */}
      <section className="px-6 md:px-12 py-10 pb-14 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "var(--font-pacifico)" }}>Hot Handicrafts</h2>
          <p className="text-xs mt-0.5" style={{ color: "#3E2C2C" }}>Our most-loved pieces</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <div key={i} className="bg-white/80 rounded-2xl shadow-sm border border-white/60 p-4 relative group hover:scale-[1.02] hover:shadow-md transition-all duration-200">
              <div className="h-[140px] flex items-center justify-center bg-gray-50/50 rounded-xl mb-3">
                <Image src={product.img} alt={product.name} width={120} height={120} className="object-contain w-full h-auto max-h-[120px]" />
              </div>
              <p className="font-semibold text-sm text-gray-800">{product.name}</p>
              <p className="text-[#4b2e2e] font-bold mt-0.5 text-sm group-hover:text-[#7a2e2e] transition-colors">₱{product.price}</p>
              <div className="absolute inset-0 bg-[#2a1515]/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link href="/login" className="bg-white text-gray-800 text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg">View Product</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
