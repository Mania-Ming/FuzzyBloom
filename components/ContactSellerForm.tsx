"use client"

import { useState } from "react"

export default function ContactSellerForm({ productName }: { productName: string }) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, productName }),
      })
      setStatus(res.ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
        <p className="text-green-700 font-semibold text-sm">✅ Message sent!</p>
        <p className="text-green-600 text-xs mt-1">The seller will reply to your email soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border border-gray-100 rounded-2xl p-4 bg-white/60 flex flex-col gap-3">
      <p className="text-sm font-semibold text-[#2a1515]">Contact Seller</p>
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4b2e2e] bg-white"
      />
      <textarea
        required
        placeholder={`Ask about "${productName}"...`}
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4b2e2e] bg-white resize-none"
      />
      {status === "error" && (
        <p className="text-red-500 text-xs">Failed to send. Please try again.</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-2.5 rounded-full bg-[#4b2e2e] text-white text-sm font-semibold hover:bg-[#3a2323] transition disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}
