"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"
import { MessageCircle } from "lucide-react"

type Message = {
  id: string
  message: string
  reply: string | null
  is_read: boolean
  created_at: string
  product_id: string | null
  products: { name: string } | null
}

export default function MessagesPage() {
  const { data: user } = useMe()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState("")

  const load = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, message, reply, is_read, created_at, product_id, products:product_id(name)")
      .eq("sender_id", userId)
      .order("created_at", { ascending: true })

    if (error) { console.error("Messages error:", error.message); setLoading(false); return }

    const msgs = (data as any) ?? []
    setMessages(msgs)
    setLoading(false)

    // Check for new unread replies and show toast
    const newReplies = msgs.filter((m: Message) => m.reply && !m.is_read)
    if (newReplies.length > 0) {
      setToastMsg(`You have ${newReplies.length} new repl${newReplies.length > 1 ? "ies" : "y"} from the seller!`)
      setTimeout(() => setToastMsg(""), 4000)
    }

    // Mark all replied messages as read
    const unreadIds = newReplies.map((m: Message) => m.id)
    if (unreadIds.length > 0) {
      await supabase.from("messages").update({ is_read: true }).in("id", unreadIds)
      setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m))
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return
    load(user.id)

    // Realtime: re-fetch when admin replies
    const channel = supabase
      .channel("user-messages-" + user.id)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "messages",
        filter: `sender_id=eq.${user.id}`
      }, () => load(user.id))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, load])

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />

        {/* TOAST */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#2a1515] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium fade-up flex items-center gap-2">
            <MessageCircle size={15} /> {toastMsg}
          </div>
        )}

        <main className="flex-1 max-w-2xl mx-auto w-full px-6 md:px-12 py-10">
          <div className="flex items-center gap-2 mb-8">
            <MessageCircle size={22} className="text-[#4b2e2e]" />
            <div>
              <h1 className="text-2xl font-bold text-[#2a1515]">My Messages</h1>
              <p className="text-gray-400 text-sm mt-0.5">Your conversations with the seller</p>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="bg-white/80 rounded-3xl border border-white/60 py-20 text-center">
              <MessageCircle size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Send a message from any product page</p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white/80 rounded-3xl border border-white/60 shadow-sm overflow-hidden">

                {/* PRODUCT LABEL */}
                {msg.products && (
                  <div className="px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-1.5">
                    <span className="text-base">🌸</span>
                    <span className="text-xs font-semibold text-gray-500">{(msg.products as any).name}</span>
                  </div>
                )}

                <div className="px-5 py-4 space-y-3">

                  {/* USER MESSAGE — right aligned */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="bg-[#4b2e2e] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                        {msg.message}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ADMIN REPLY — left aligned */}
                  {msg.reply ? (
                    <div className="flex justify-start">
                      <div className="max-w-[80%]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold">FB</span>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500">Fuzzy Bloom</span>
                        </div>
                        <div className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed">
                          {msg.reply}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-gray-400">Waiting for reply...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
