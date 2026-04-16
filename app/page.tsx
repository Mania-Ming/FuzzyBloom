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

  function nextSlide() {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length)
  }

  function prevSlide() {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-800 scroll-smooth">

      {/* TOPBAR */}
      <nav className="sticky top-0 w-full z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.jpg" alt="logo" width={36} height={36} className="rounded-full object-cover ring-2 ring-[#4b2e2e]/20" />
            <span className="hidden sm:block font-semibold text-[#4b2e2e] text-sm tracking-wide">Fuzzy Bloom</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#4b2e2e] hover:bg-[#4b2e2e]/5 transition">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-full text-sm font-medium bg-[#4b2e2e] text-white hover:bg-[#3a2323] transition shadow-sm">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{ minHeight: "600px", position: "relative" }}
        className="w-full flex items-center"
      >
        {/* OVERLAY */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 40%, rgba(255,255,255,0.3) 70%, rgba(255,255,255,0.1) 100%)" }} />

        {/* CONTENT */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "60px 80px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            gap: "40px",
          }}
        >

          {/* LEFT */}
          <div style={{ maxWidth: "500px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#b06080", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: 12 }}>
              ✦ Handmade with Love
            </p>
            <h1 style={{ fontFamily: "var(--font-pacifico)", fontSize: 64, fontWeight: 700, color: "#2a1515", lineHeight: 1.1, marginBottom: 16 }}>
              Fuzzy Bloom
            </h1>
            <p style={{ fontSize: 18, color: "#555", lineHeight: 1.7, marginBottom: 24, maxWidth: 520 }}>
              Handmade floral crafts and decorative pieces inspired by nature, creativity, and the joy of meaningful gifts.
            </p>

            {/* BUTTONS */}
            <div className="flex flex-wrap" style={{ gap: 15, marginBottom: 20 }}>
              <Link href="/login" style={{ padding: "12px 26px", fontSize: 16, fontWeight: 600, color: "white", background: "#4b2e2e", borderRadius: 999, boxShadow: "0 6px 16px rgba(75,46,46,0.25)", transition: "background 0.2s" }}
                className="hover:bg-[#3a2323]">
                Shop Now
              </Link>
              <Link href="/about" style={{ padding: "12px 26px", fontSize: 16, fontWeight: 600, border: "2px solid rgba(75,46,46,0.35)", borderRadius: 999, transition: "all 0.2s" }}
                className="text-[#4b2e2e] hover:bg-[#4b2e2e] hover:text-white hover:border-[#4b2e2e]">
                About Us
              </Link>
            </div>

            {/* CATEGORY PILLS */}
            <div className="flex flex-wrap" style={{ gap: 10, marginTop: 20, marginBottom: 16 }}>
              {categories.map((cat, i) => (
                <Link key={i} href={cat.link}>
                  <div
                    style={{ backgroundColor: cat.bg, borderRadius: 999, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.8)", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                    className="hover:-translate-y-1 hover:shadow-md"
                  >
                    <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{cat.icon}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "#aaa" }}>Made with love in the Philippines 🇵🇭</p>
          </div>

          {/* RIGHT — GLASS CAROUSEL */}
          <div
            style={{
              width: "100%",
              maxWidth: "550px",
              height: "420px",
              marginLeft: "auto",
              borderRadius: "25px",
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <img
              src={carouselImages[currentIndex]}
              alt="product"
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "20px", transition: "opacity 0.4s ease" }}
            />

            <button onClick={prevSlide}
              style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", borderRadius: "50%", background: "white", border: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s ease", zIndex: 10 }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}
            >←</button>

            <button onClick={nextSlide}
              style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", borderRadius: "50%", background: "white", border: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s ease", zIndex: 10 }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}
            >→</button>

            <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 10 }}>
              {carouselImages.map((_, i) => (
                <button key={i} onClick={() => setCurrentIndex(i)}
                  style={{ width: i === currentIndex ? "20px" : "8px", height: "8px", borderRadius: "4px", background: i === currentIndex ? "#4b2e2e" : "rgba(255,255,255,0.7)", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }}
                />
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
