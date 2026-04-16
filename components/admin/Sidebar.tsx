"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Products", href: "/admin/products", icon: "🌸" },
  { label: "Orders", href: "/admin/orders", icon: "📦" },
  { label: "Users", href: "/admin/users", icon: "👤" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-[#2a1515] text-white">

      {/* BRAND */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Image src="/logo.jpg" alt="logo" width={36} height={36} className="rounded-full object-cover ring-2 ring-white/20" />
        <div>
          <p className="font-bold text-sm leading-tight">Fuzzy Bloom</p>
          <p className="text-white/40 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* LOGOUT */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/8 hover:text-white transition"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
