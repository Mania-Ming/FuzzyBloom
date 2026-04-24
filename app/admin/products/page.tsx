"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { Edit2, Trash2, CheckCircle, XCircle, Package } from "lucide-react"

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  color: string
  is_available: boolean
}

const CATEGORIES = ["All", "Bouquets", "Flower Keychains", "Ribbon Keychains", "Headbands"]

const emptyForm = { name: "", description: "", price: "", category: "Bouquets", image_url: "", color: "", is_available: true }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [toast, setToast] = useState<ToastType>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("name")
    setProducts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let list = products
    if (category !== "All") list = list.filter(p => p.category === category)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    setFiltered(list)
  }, [products, search, category])

  function openAdd() { setEditing(null); setForm(emptyForm); setShowForm(true) }
  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image_url: p.image_url, color: p.color, is_available: p.is_available })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: Number(form.price) }

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id)
      if (error) { setToast({ message: "Failed to update product.", type: "error" }) }
      else { setToast({ message: "Product updated!", type: "success" }); setShowForm(false); load() }
    } else {
      const { error } = await supabase.from("products").insert(payload)
      if (error) { setToast({ message: "Failed to add product.", type: "error" }) }
      else { setToast({ message: "Product added!", type: "success" }); setShowForm(false); load() }
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from("products").delete().eq("id", deleteTarget)
    if (error) setToast({ message: "Failed to delete.", type: "error" })
    else { setToast({ message: "Product deleted.", type: "success" }); load() }
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {deleteTarget && <ConfirmModal message="Are you sure you want to delete this product?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={openAdd} className="bg-[#4b2e2e] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3a2323] transition shadow-md shadow-[#4b2e2e]/20">
          + Add Product
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 w-56" />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition border ${category === c ? "bg-[#4b2e2e] text-white border-[#4b2e2e]" : "bg-white text-gray-500 border-gray-200 hover:border-[#4b2e2e] hover:text-[#4b2e2e]"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Color</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No products found</td></tr>}
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100" />
                        : <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center"><Package size={16} className="text-pink-300" /></div>
                      }
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.category}</td>
                  <td className="px-6 py-4 text-gray-500">{p.color || "—"}</td>
                  <td className="px-6 py-4 font-bold text-[#4b2e2e]">₱{Number(p.price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {p.is_available
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100"><CheckCircle size={11} /> Available</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-500 border border-red-100"><XCircle size={11} /> Sold Out</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
                        <Edit2 size={11} /> Edit
                      </button>
                      <button onClick={() => setDeleteTarget(p.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto fade-up">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="px-8 py-6 space-y-4">
              {[
                { label: "Product Name", key: "name", type: "text", required: true },
                { label: "Image URL", key: "image_url", type: "text" },
                { label: "Price (₱)", key: "price", type: "number", required: true },
                { label: "Color", key: "color", type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  <input type={f.type} required={f.required} value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 transition" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 transition resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 transition">
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="available" checked={form.is_available} onChange={e => setForm(prev => ({ ...prev, is_available: e.target.checked }))}
                  className="w-4 h-4 accent-[#4b2e2e]" />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">Available for purchase</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-full bg-[#4b2e2e] text-white text-sm font-semibold hover:bg-[#3a2323] transition disabled:opacity-60">
                  {saving ? "Saving..." : editing ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
