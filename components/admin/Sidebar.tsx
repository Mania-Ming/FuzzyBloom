"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, MessageCircle } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin", Icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", Icon: Package },
  { label: "Orders", href: "/admin/orders", Icon: ShoppingBag },
  { label: "Users", href: "/admin/users", Icon: Users },
  { label: "Messages", href: "/admin/messages", Icon: MessageCircle },
  { label: "Settings", href: "/admin/settings", Icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.setItem("isLoggedIn", "false")
    window.location.replace("/")
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
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} className={active ? "text-white" : "text-white/50"} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* LOGOUT */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
