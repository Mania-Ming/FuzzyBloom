"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"

export default function Navbar() {
  const { data: user } = useMe()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function updateCounts() {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      setCartCount(cart.reduce((sum: number, i: any) => sum + (i.qty || 1), 0))
      setWishlistCount(wishlist.length)
    }
    updateCounts()
    window.addEventListener("storage", updateCounts)
    const interval = setInterval(updateCounts, 1000)
    return () => { window.removeEventListener("storage", updateCounts); clearInterval(interval) }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.setItem("isLoggedIn", "false")
    window.location.replace("/")
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <nav className="sticky top-0 w-full z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-5 md:px-12 h-16 flex items-center justify-between gap-4">

        {/* LOGO */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.jpg" alt="logo" width={38} height={38} className="rounded-full object-cover ring-2 ring-[#4b2e2e]/20" />
          <span className="hidden sm:block font-semibold text-[#4b2e2e] text-sm tracking-wide">Fuzzy Bloom</span>
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-1 md:gap-2">

          <Link href="/about" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#4b2e2e] hover:bg-[#4b2e2e]/5 transition">
            About
          </Link>

          <Link href="/orders" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#4b2e2e] hover:bg-[#4b2e2e]/5 transition">
            Orders
          </Link>

          {/* WISHLIST */}
          <Link href="/wishlist" className="relative p-2 rounded-lg text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* CART */}
          <Link href="/cart" className="relative p-2 rounded-lg text-gray-600 hover:text-[#4b2e2e] hover:bg-[#4b2e2e]/5 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#4b2e2e] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                {cartCount}
              </span>
            )}
          </Link>

          {/* PROFILE DROPDOWN */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition focus:outline-none"
            >
              {user?.profile_image ? (
                <Image src={user.profile_image} alt="profile" width={32} height={32} className="rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
              )}
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[90px] truncate">{user?.full_name ?? "Profile"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1 fade-up">
                <div className="px-4 py-2.5 border-b border-gray-50">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.full_name}</p>
                </div>
                <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
