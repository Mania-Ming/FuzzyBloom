import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/Footer"

const categories = [
  { name: "Bouquets", icon: "🌸", link: "/bouquets", bg: "from-pink-100 to-rose-200" },
  { name: "Flower Keychains", icon: "🌼", link: "/flower-keychains", bg: "from-yellow-100 to-amber-200" },
  { name: "Ribbon Keychains", icon: "🎀", link: "/ribbon-keychains", bg: "from-purple-100 to-violet-200" },
  { name: "Headbands", icon: "👑", link: "/headbands", bg: "from-rose-100 to-pink-200" },
]

const products = [
  { name: "Lavender Grace", img: "/p1.png", price: 350 },
  { name: "Rose Romance", img: "/p2.png", price: 420 },
  { name: "Flower Keychain", img: "/k1.png", price: 25 },
  { name: "Ribbon Keychain", img: "/r1.png", price: 20 },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col text-gray-800">

      {/* TOPBAR */}
      <nav className="sticky top-0 w-full z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.jpg" alt="logo" width={38} height={38} className="rounded-full object-cover ring-2 ring-[#4b2e2e]/20" />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8d5e8] via-[#f0e0ec] to-[#ddd0dd]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20 flex flex-wrap items-center justify-between gap-10">
          <div className="max-w-md fade-up">
            <span className="inline-block text-xs font-semibold text-[#4b2e2e] bg-[#4b2e2e]/10 px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              Handmade with Love
            </span>
            <h1 className="text-5xl md:text-6xl mb-3 text-[#2a1515] leading-tight" style={{ fontFamily: "var(--font-pacifico)" }}>
              Fuzzy Bloom
            </h1>
            <p className="text-[#4b2e2e]/70 font-medium mb-2">Handicrafts by Kate</p>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Handmade floral crafts and decorative pieces inspired by nature, creativity, and the joy of meaningful gifts.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/login" className="bg-[#4b2e2e] text-white px-7 py-3 rounded-full hover:bg-[#3a2323] transition font-medium shadow-md shadow-[#4b2e2e]/20 text-sm">
                Shop Now
              </Link>
              <Link href="/about" className="border border-[#4b2e2e]/30 text-[#4b2e2e] px-7 py-3 rounded-full hover:bg-[#4b2e2e] hover:text-white transition font-medium text-sm">
                About Us
              </Link>
            </div>
          </div>
          <div className="relative fade-up">
            <div className="absolute inset-0 bg-[#4b2e2e]/10 rounded-full blur-3xl scale-110" />
            <Image src="/logo.jpg" alt="Fuzzy Bloom" width={220} height={220} className="relative rounded-full object-cover shadow-2xl ring-4 ring-white/60" />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
          <p className="text-gray-500 text-sm mt-1">Explore our handcrafted collections</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link key={i} href={cat.link}>
              <div className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 card-hover cursor-pointer h-36 border border-white/60`}>
                <span className="text-4xl">{cat.icon}</span>
                <p className="font-semibold text-sm text-center text-gray-700">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS PREVIEW */}
      <section className="px-6 md:px-12 py-4 pb-14 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "var(--font-pacifico)" }}>Hot Handicrafts</h2>
            <p className="text-gray-500 text-sm mt-0.5">Our most-loved pieces</p>
          </div>
          <Link href="/login" className="text-sm text-[#4b2e2e] font-medium hover:underline flex items-center gap-1">
            Login to shop →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <div key={i} className="bg-white/80 rounded-2xl shadow-sm border border-white/60 p-4 relative group card-hover">
              <div className="h-[170px] flex items-center justify-center bg-gray-50/50 rounded-xl mb-3">
                <Image src={product.img} alt={product.name} width={150} height={150} className="object-contain w-full h-auto max-h-[150px]" />
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
