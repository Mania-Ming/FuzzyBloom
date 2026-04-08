"use client"

import Image from "next/image"
import SmartNavbar from "@/components/SmartNavbar"
import Footer from "@/components/Footer"

const crafts = ["Handmade Bouquets", "Flower Keychains", "Ribbon Keychains", "Headbands"]
const reasons = ["Handmade with love", "Quality over quantity", "Soft aesthetic designs", "Supporting small handmade art", "Creating meaningful gifts"]

export default function About() {
  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      <SmartNavbar />

        <main className="max-w-6xl mx-auto px-6 md:px-12 py-14 flex-1 w-full">

          {/* HEADER */}
          <div className="text-center mb-14 fade-up">
            <h1 className="text-4xl md:text-5xl text-[#2a1515] mb-3" style={{ fontFamily: "var(--font-pacifico)" }}>
              About Fuzzy Bloom
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              A small handmade brand dedicated to creating soft, heartfelt floral crafts that turn simple moments into meaningful memories.
            </p>
          </div>

          {/* OUR STORY */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm p-8 md:p-10 mb-8 fade-up">
            <h2 className="text-2xl mb-6 text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>Our Story</h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Image
                src="/kate.jpg"
                alt="Kate"
                width={160}
                height={160}
                className="rounded-2xl object-cover shadow-md shrink-0"
              />
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Fuzzy Bloom was founded by <span className="font-semibold text-gray-800">Kate Dorraine Ceniza</span>, a handmade artist inspired by flowers, creativity, and the joy of giving.
                </p>
                <p>
                  What started as a simple craft hobby grew into a passion for designing floral bouquets, keychains, headbands, and accessories that are lovingly made by hand.
                </p>
                <p>
                  Every piece is crafted with care, patience, and attention to detail — because we believe handmade items carry warmth that mass-produced products never can.
                </p>
              </div>
            </div>
          </div>

          {/* WHAT WE CREATE + WHY CHOOSE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-up">

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm p-8">
              <h2 className="text-xl mb-5 text-[#2a1515]" style={{ fontFamily: "var(--font-pacifico)" }}>What We Create</h2>
              <ul className="space-y-3">
                {crafts.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-[#4b2e2e]/40 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#4b2e2e] to-[#7a4a4a] rounded-3xl shadow-sm p-8 text-white">
              <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-pacifico)" }}>Why Choose Fuzzy Bloom?</h2>
              <ul className="space-y-3">
                {reasons.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <span className="w-2 h-2 rounded-full bg-white/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </main>

      <Footer />
    </div>
  )
}
