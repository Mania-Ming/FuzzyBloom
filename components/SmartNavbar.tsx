"use client"

import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import { useEffect, useState } from "react"

export default function SmartNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true")
    setMounted(true)
  }, [])

  // Don't render anything until we've read localStorage to avoid flash
  if (!mounted) return (
    <div className="sticky top-0 w-full h-16 bg-white/70 backdrop-blur-xl border-b border-white/30 z-50" />
  )

  if (isLoggedIn) return <Navbar />

  return (
    <nav className="sticky top-0 w-full z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-5 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.jpg" alt="logo" width={38} height={38} className="rounded-full object-cover ring-2 ring-[#4b2e2e]/20" />
          <span className="hidden sm:block font-semibold text-[#4b2e2e] text-sm tracking-wide">Fuzzy Bloom</span>
        </Link>
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
  )
}
