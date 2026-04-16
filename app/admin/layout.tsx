import Sidebar from "@/components/admin/Sidebar"
import AdminGuard from "@/components/admin/AdminGuard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#fdf6f0]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP HEADER */}
          <header className="h-14 bg-white/80 backdrop-blur-md border-b border-[#e8d5d5] flex items-center px-8 shrink-0">
            <p className="text-sm text-gray-400">Fuzzy Bloom <span className="text-gray-300 mx-1">/</span> <span className="text-[#4b2e2e] font-medium">Admin</span></p>
          </header>
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
