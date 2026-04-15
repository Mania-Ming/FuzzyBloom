import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/Footer"

const products = [
  { name: "Lavender Grace", img: "/p1.png", price: 350 },
  { name: "Rose Romance", img: "/p2.png", price: 420 },
  { name: "Flower Keychain", img: "/k1.png", price: 25 },
  { name: "Ribbon Keychain", img: "/r1.png", price: 20 },
]

const categories = [
  { name: "Bouquet", icon: "💐", link: "/bouquets", bg: "from-pink-50 to-rose-100", border: "border-rose-200" },
  { name: "Flower", icon: "🌼", link: "/flower-keychains", bg: "from-purple-50 to-violet-100", border: "border-violet-200" },
  { name: "Ribbon", icon: "🎀", link: "/ribbon-keychains", bg: "from-amber-50 to-orange-100", border: "border-orange-200" },
  { name: "Headband", icon: "🌿", link: "/headbands", bg: "from-emerald-50 to-teal-100", border: "border-teal-200" },
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
      <section className="w-full bg-gradient-to-br from-[#fce4ec] via-[#f8d7e8] to-[#ede0f0] py-14 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/40 backdrop-blur-sm rounded-[24px] shadow-xl border border-white/60 px-10 md:px-16 py-12 flex flex-wrap items-center justify-between gap-10">

            {/* LEFT */}
            <div className="flex-1 min-w-[260px] max-w-lg">
              <p className="text-xs font-bold text-[#b06080] tracking-[0.2em] uppercase mb-4">
                ✦ Handmade with Love
              </p>
              <h1 className="text-5xl md:text-6xl mb-4 text-[#2a1515] leading-tight" style={{ fontFamily: "var(--font-pacifico)" }}>
                Fuzzy Bloom
              </h1>
              <p className="text-sm text-gray-500 mb-7 leading-relaxed max-w-sm">
                Handmade floral crafts and decorative pieces inspired by nature, creativity, and the joy of meaningful gifts.
              </p>
              <div className="flex gap-3 flex-wrap mb-5">
                <Link href="/login" className="bg-[#4b2e2e] text-white px-7 py-3 rounded-full hover:bg-[#3a2323] transition font-semibold shadow-lg shadow-[#4b2e2e]/25 text-sm">
                  Shop Now
                </Link>
                <Link href="/about" className="border-2 border-[#4b2e2e]/30 text-[#4b2e2e] px-7 py-3 rounded-full hover:bg-[#4b2e2e] hover:text-white transition font-semibold text-sm">
                  About Us
                </Link>
              </div>
              <p className="text-xs text-gray-400">Made with love in the Philippines 🇵🇭</p>
            </div>

            {/* RIGHT — bouquet image */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl scale-110" />
              <Image
                src="/p1.png"
                alt="Fuzzy Bloom Bouquet"
                width={320}
                height={320}
                className="relative object-contain drop-shadow-2xl"
              />
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="w-full py-12 px-6 md:px-16 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Explore Categories</h2>
            <p className="text-gray-400 text-sm mt-1">Find the perfect handmade item</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.link}>
                <div
                  className={`bg-gradient-to-br ${cat.bg} border ${cat.border} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg`}
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <p className="font-semibold text-sm text-gray-700">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOT HANDICRAFTS */}
      <section className="px-6 md:px-16 py-10 pb-14 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "var(--font-pacifico)" }}>Hot Handicrafts</h2>
          <p className="text-gray-400 text-xs mt-0.5">Our most-loved pieces</p>
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
