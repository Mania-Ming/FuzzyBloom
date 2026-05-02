"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Bike, MessageSquare } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin",          Icon: LayoutDashboard },
  { label: "Products",  href: "/admin/products",  Icon: Package         },
  { label: "Orders",    href: "/admin/orders",    Icon: ShoppingBag     },
  { label: "Riders",    href: "/admin/riders",    Icon: Bike            },
  { label: "Users",     href: "/admin/users",     Icon: Users           },
  { label: "Messages",  href: "/admin/messages",  Icon: MessageSquare   },
  { label: "Settings",  href: "/admin/settings",  Icon: Settings        },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [pendingOrders, setPendingOrders]   = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [adminId, setAdminId]               = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAdminId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    async function fetchCounts() {
      const { count: orderCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "Pending")
      setPendingOrders(orderCount ?? 0)

      if (adminId) {
        const { count: msgCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("is_read", false)
          .neq("sender_id", adminId)
        setUnreadMessages(msgCount ?? 0)
      }
    }

    fetchCounts()

    const channel = supabase
      .channel("sidebar-counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchCounts)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [adminId])

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.setItem("isLoggedIn", "false")
    window.location.replace("/")
  }

  return (
    <aside className="w-60 shrink-0 h-screen flex flex-col bg-[#2b1e1e]">

      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Image src="/logo.jpg" alt="logo" width={36} height={36} className="rounded-full object-cover ring-2 ring-white/20" />
        <div>
          <p className="font-bold text-sm text-white leading-tight">Fuzzy Bloom</p>
          <p className="text-white/40 text-xs">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
          const badge = href === "/admin/orders" ? pendingOrders
                      : href === "/admin/messages" ? unreadMessages
                      : 0
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:bg-white/8 hover:text-white/80"
              }`}
            >
              <Icon size={18} className={active ? "text-white" : "text-white/40"} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/20 hover:text-red-400 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
