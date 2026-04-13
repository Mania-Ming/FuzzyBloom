import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/Footer"

const products = [
  { name: "Lavender Grace", img: "/p1.png", price: 350 },
  { name: "Rose Romance", img: "/p2.png", price: 420 },
  { name: "Flower Keychain", img: "/k1.png", price: 25 },
  { name: "Ribbon Keychain", img: "/r1.png", price: 20 },
]

export default function Home() {
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
      <section className="bg-gradient-to-br from-[#e8d5e8] via-[#f0e0ec] to-[#ddd0dd] w-full">
        <div className="w-full px-8 md:px-16 py-12 flex flex-wrap items-center justify-between gap-6">

          {/* LEFT */}
          <div className="max-w-sm">
            <span className="inline-block text-xs font-semibold text-[#4b2e2e] bg-[#4b2e2e]/10 px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
              Handmade with Love
            </span>
            <h1 className="text-4xl md:text-5xl mb-2 text-[#2a1515] leading-tight" style={{ fontFamily: "var(--font-pacifico)" }}>
              Fuzzy Bloom
            </h1>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Handmade floral crafts and decorative pieces inspired by nature, creativity, and the joy of meaningful gifts.
            </p>
            <div className="flex gap-3 flex-wrap mb-4">
              <Link href="/login" className="bg-[#4b2e2e] text-white px-6 py-2.5 rounded-full hover:bg-[#3a2323] transition font-medium shadow-md shadow-[#4b2e2e]/20 text-sm">
                Shop Now
              </Link>
              <Link href="/about" className="border border-[#4b2e2e]/30 text-[#4b2e2e] px-6 py-2.5 rounded-full hover:bg-[#4b2e2e] hover:text-white transition font-medium text-sm">
                About Us
              </Link>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-white/80 border border-white/60 text-gray-600 text-xs px-3 py-1.5 rounded-full shadow-sm">
              Made with love in the Philippines 🇵🇭
            </span>
          </div>

          {/* RIGHT — collage layout */}
          <div className="flex gap-3 h-72">

            {/* LEFT — tall full-height */}
            <Link href="/bouquets" className="flex-1">
              <div className="bg-purple-100 hover:bg-purple-200 h-full rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/60 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer">
                <span className="text-4xl">🌸</span>
                <p className="text-xs font-semibold text-gray-700">Bouquet</p>
              </div>
            </Link>

            {/* RIGHT — 3 stacked rectangles */}
            <div className="flex flex-col gap-3 flex-1">
              <Link href="/flower-keychains" className="flex-[2]">
                <div className="bg-pink-100 hover:bg-pink-200 h-full rounded-2xl flex flex-col items-center justify-center gap-1.5 border border-white/60 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer">
                  <span className="text-3xl">🌼</span>
                  <p className="text-xs font-semibold text-gray-700">Flower</p>
                </div>
              </Link>
              <Link href="/ribbon-keychains" className="flex-1">
                <div className="bg-orange-50 hover:bg-orange-100 h-full rounded-2xl flex flex-col items-center justify-center gap-1.5 border border-white/60 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer">
                  <span className="text-2xl">🎀</span>
                  <p className="text-xs font-semibold text-gray-700">Ribbon</p>
                </div>
              </Link>
              <Link href="/headbands" className="flex-[2]">
                <div className="bg-emerald-50 hover:bg-emerald-100 h-full rounded-2xl flex flex-col items-center justify-center gap-1.5 border border-white/60 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer">
                  <span className="text-3xl">👑</span>
                  <p className="text-xs font-semibold text-gray-700">Headband</p>
                </div>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* PRODUCTS PREVIEW */}
      <section className="px-6 md:px-12 py-4 pb-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-pacifico)" }}>Hot Handicrafts</h2>
            <p className="text-gray-500 text-xs mt-0.5">Our most-loved pieces</p>
          </div>
          <Link href="/login" className="text-sm text-[#4b2e2e] font-medium hover:underline">
            Login to shop →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <div key={i} className="bg-white/80 rounded-2xl shadow-sm border border-white/60 p-4 relative group card-hover">
              <div className="h-[140px] flex items-center justify-center bg-gray-50/50 rounded-xl mb-3">
                <Image src={product.img} alt={product.name} width={120} height={120} className="object-contain w-full h-auto max-h-[120px]" />
              </div>
              <p className="font-semibold text-sm text-gray-800">{product.name}</p>
              <p className="text-[#4b2e2e] font-bold mt-0.5 text-sm">₱{product.price}</p>
              <div className="absolute inset-0 bg-[#2a1515]/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link href="/login" className="bg-white text-gray-800 text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-gray-50 transition shadow-lg">
                  Login to Purchase
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
