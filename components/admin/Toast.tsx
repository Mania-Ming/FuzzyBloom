"use client"

import { useEffect } from "react"

export type ToastType = { message: string; type: "success" | "error" } | null

interface Props {
  toast: ToastType
  onClose: () => void
}

export default function Toast({ toast, onClose }: Props) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium transition-all fade-up ${
      toast.type === "success"
        ? "bg-[#2a1515] text-white"
        : "bg-red-500 text-white"
    }`}>
      <span>{toast.type === "success" ? "✓" : "✕"}</span>
      {toast.message}
    </div>
  )
}
