"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMe } from "@/lib/hooks/useMe"
import { useLogout } from "@/lib/hooks/useLogout"

export default function Navbar() {

  const router = useRouter()
  const { data: user } = useMe()
  const { mutate: logout } = useLogout()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.push("/"),
      onError: () => router.push("/"),
    })
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <div className="sticky top-0 w-full h-[88px] flex items-center justify-between px-6 md:px-16 backdrop-blur-md bg-white/30 z-50">

      {/* LOGO */}
      <Link href="/dashboard">
        <Image
          src="/logo.jpg"
          alt="logo"
          width={50}
          height={50}
          className="rounded-full object-cover"
        />
      </Link>

      {/* NAV LINKS + PROFILE */}
      <div className="flex items-center gap-6 md:gap-10 font-medium text-sm">

        <Link href="/about">About Us</Link>
        <Link href="/wishlist">Wishlist</Link>
        <Link href="/cart">Cart</Link>
        <Link href="/orders">Orders</Link>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={dropdownRef}>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            {user?.profile_image ? (
              <Image
                src={user.profile_image}
                alt="profile"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#4b2e2e] text-white flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
            )}
            <span className="hidden md:block">{user?.full_name ?? "Profile"}</span>
            <span className="text-xs">▾</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-3 text-sm hover:bg-gray-50 transition"
              >
                👤 Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50 transition"
              >
                🚪 Logout
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
