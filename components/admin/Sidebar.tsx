"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, MessageCircle, Bike } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin",          Icon: LayoutDashboard },
  { label: "Products",  href: "/admin/products",  Icon: Package         },
  { label: "Orders",    href: "/admin/orders",    Icon: ShoppingBag     },
  { label: "Riders",    href: "/admin/riders",    Icon: Bike            },
  { label: "Users",     href: "/admin/users",     Icon: Users           },
  { label: "Messages",  href: "/admin/messages",  Icon: MessageCircle   },
  { label: "Settings",  href: "/admin/settings",  Icon: Settings        },
]

export default function Sidebar() {
  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.setItem("isLoggedIn", "false")
    window.location.replace("/")
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col backdrop-blur-xl bg-white/20 border-r border-white/30 shadow-xl">

      {/* BRAND */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/20">
        <Image src="/logo.jpg" alt="logo" width={36} height={36} className="rounded-full object-cover ring-2 ring-[#4b2e2e]/30" />
        <div>
          <p className="font-bold text-sm text-[#2a1515] leading-tight">Fuzzy Bloom</p>
          <p className="text-[#4b2e2e]/50 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-[#4b2e2e]/10 text-[#4b2e2e] shadow-sm"
                  : "text-[#4b2e2e]/50 hover:bg-[#4b2e2e]/5 hover:text-[#4b2e2e]"
              }`}
            >
              <Icon size={18} className={active ? "text-[#4b2e2e]" : "text-[#4b2e2e]/40"} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* LOGOUT */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#4b2e2e]/50 hover:bg-red-50 hover:text-red-500 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
