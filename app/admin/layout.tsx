"use client"

import { usePathname } from "next/navigation"
import Sidebar from "@/components/admin/Sidebar"
import AdminGuard from "@/components/admin/AdminGuard"

function getPageTitle(pathname: string): string {
  if (pathname.includes("products")) return "Products"
  if (pathname.includes("orders"))   return "Orders"
  if (pathname.includes("riders"))   return "Riders"
  if (pathname.includes("users"))    return "Users"
  if (pathname.includes("messages")) return "Messages"
  if (pathname.includes("settings")) return "Settings"
  return "Dashboard"
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#fdf6f0]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white/70 backdrop-blur-md border-b border-[#e8d5d5] flex items-center px-8 shrink-0">
            <div>
              <p className="text-base font-bold text-[#2a1515]">{title}</p>
              <p className="text-xs text-gray-400">Welcome back, Admin</p>
            </div>
          </header>
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
