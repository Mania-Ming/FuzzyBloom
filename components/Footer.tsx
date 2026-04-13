"use client"

import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#2a1515] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image src="/logo.jpg" alt="logo" width={44} height={44} className="rounded-full object-cover ring-2 ring-white/20" />
              <div>
                <p className="font-bold text-base leading-tight">Fuzzy Bloom</p>
                <p className="text-white/50 text-xs">Handicrafts by Kate</p>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-[220px]">
              Handmade floral crafts inspired by nature, creativity, and meaningful gifts.
            </p>
            <p className="text-white/40 text-xs mt-3">
              <a
                href="https://www.facebook.com/kate.dorraine.ceniza"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Facebook: Kate Dorraine Ceniza
              </a>
            </p>
          </div>

          {/* SHOP */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Shop</p>
            <div className="space-y-2.5">
              {[
                { label: "Bouquets", href: "/bouquets" },
                { label: "Flower Keychains", href: "/flower-keychains" },
                { label: "Ribbon Keychains", href: "/ribbon-keychains" },
                { label: "Headbands", href: "/headbands" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block text-white/50 text-sm hover:text-white transition">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Company</p>
            <div className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Our Story", href: "/about" },
                { label: "My Orders", href: "/orders" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="block text-white/50 text-sm hover:text-white transition">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/30 text-xs">
          © 2026 Fuzzy Bloom Handicrafts by Kate. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
