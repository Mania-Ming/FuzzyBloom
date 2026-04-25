"use client"

import Sidebar from "@/components/admin/Sidebar"
import AdminGuard from "@/components/admin/AdminGuard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-[#f7f0eb]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
