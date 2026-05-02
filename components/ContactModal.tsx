"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { MessageCircle, X } from "lucide-react"

// ── Shared modal dialog ──────────────────────────────────────────────────────
interface DialogProps {
  open: boolean
  onClose: () => void
  productName: string
}

export function ContactModalDialog({ open, onClose, productName }: DialogProps) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [notLoggedIn, setNotLoggedIn] = useState(false)

  useEffect(() => {
    if (!open) return
    setStatus("idle")
    setMessage("")
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "")
      setNotLoggedIn(!data.user)
    })
  }, [open])

  function handleClose() {
    onClose()
    setMessage("")
    setStatus("idle")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (notLoggedIn) return
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, productName }),
      })
      if (res.ok) {
        setStatus("success")
        setTimeout(handleClose, 1800)
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#2a1515]">Contact Seller</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">Re: {productName}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        {notLoggedIn ? (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500">Please login first to contact the seller.</p>
          </div>
        ) : status === "success" ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-semibold text-green-700">Message sent successfully!</p>
            <p className="text-xs text-gray-400 mt-1">The seller will reply to your email soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Your Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Message</label>
              <textarea
                required
                rows={4}
                placeholder={`Ask about "${productName}"...`}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4b2e2e] resize-none"
              />
            </div>
            {status === "error" && (
              <p className="text-red-500 text-xs">Failed to send. Please try again.</p>
            )}
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 py-2.5 rounded-full bg-[#4b2e2e] text-white text-sm font-semibold hover:bg-[#3a2323] transition disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Icon trigger button (self-contained, for detail pages) ───────────────────
export default function ContactModal({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Contact Seller"
        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#4b2e2e] hover:text-[#4b2e2e] hover:scale-110 transition"
      >
        <MessageCircle size={16} />
      </button>
      <ContactModalDialog open={open} onClose={() => setOpen(false)} productName={productName} />
    </>
  )
}
