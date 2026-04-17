"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"
import { MessageCircle, Send, Package } from "lucide-react"

type Message = {
  id: string
  message: string
  reply: string | null
  user_reply: string | null
  user_reply_at: string | null
  is_read: boolean
  created_at: string
  product_id: string | null
  products: { name: string; image_url: string | null } | null
}

export default function MessagesPage() {
  const { data: user } = useMe()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState("")
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, message, reply, user_reply, user_reply_at, is_read, created_at, product_id, products:product_id(name, image_url)")
      .eq("sender_id", userId)
      .order("created_at", { ascending: true })

    if (error) { console.error("Messages error:", error.message); setLoading(false); return }

    const msgs = (data as any) ?? []
    setMessages(msgs)
    setLoading(false)

    // Toast for new unread replies
    const newReplies = msgs.filter((m: Message) => m.reply && !m.is_read)
    if (newReplies.length > 0) {
      setToastMsg(`You have ${newReplies.length} new repl${newReplies.length > 1 ? "ies" : "y"} from the seller!`)
      setTimeout(() => setToastMsg(""), 4000)
      // Mark as read
      const ids = newReplies.map((m: Message) => m.id)
      await supabase.from("messages").update({ is_read: true }).in("id", ids)
      setMessages(prev => prev.map(m => ids.includes(m.id) ? { ...m, is_read: true } : m))
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return
    load(user.id)
    const channel = supabase
      .channel("user-messages-" + user.id)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` },
        () => load(user.id))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, load])

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendUserReply(msgId: string) {
    if (!replyText.trim()) return
    setSending(true)
    const { error } = await supabase
      .from("messages")
      .update({ user_reply: replyText.trim(), user_reply_at: new Date().toISOString(), is_read: false })
      .eq("id", msgId)
    if (!error) {
      setMessages(prev => prev.map(m => m.id === msgId
        ? { ...m, user_reply: replyText.trim(), user_reply_at: new Date().toISOString() }
        : m
      ))
    }
    setReplyText("")
    setReplyTarget(null)
    setSending(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />

        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#2a1515] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium fade-up flex items-center gap-2">
            <MessageCircle size={15} /> {toastMsg}
          </div>
        )}

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-8 py-8">

          {/* HEADER */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-10 h-10 rounded-2xl bg-[#4b2e2e]/10 flex items-center justify-center">
              <MessageCircle size={20} className="text-[#4b2e2e]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2a1515]">My Messages</h1>
              <p className="text-gray-400 text-xs mt-0.5">Conversations with Fuzzy Bloom</p>
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

          <div className="space-y-5">
            {messages.map(msg => {
              const product = msg.products as any
              return (
                <div key={msg.id} className="bg-white/90 rounded-3xl border border-white/60 shadow-sm overflow-hidden">

                  {/* PRODUCT HEADER */}
                  {product && (
                    <div className="flex items-center gap-3 px-5 py-3 bg-[#fdf6f0] border-b border-[#e8d5d5]">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} width={36} height={36}
                          className="rounded-xl object-cover border border-white shadow-sm" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-pink-300" />
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">About</p>
                        <p className="text-sm font-semibold text-[#2a1515] leading-tight">{product.name}</p>
                      </div>
                    </div>
                  )}

                  {/* CHAT THREAD */}
                  <div className="px-4 py-4 space-y-3">

                    {/* USER ORIGINAL MESSAGE — right */}
                    <div className="flex justify-end">
                      <div className="max-w-[78%]">
                        <div className="bg-[#4b2e2e] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                          {msg.message}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 text-right">
                          You · {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* ADMIN REPLY — left */}
                    {msg.reply ? (
                      <div className="flex justify-start items-end gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] flex items-center justify-center shrink-0 mb-4">
                          <span className="text-[8px] text-white font-bold">FB</span>
                        </div>
                        <div className="max-w-[78%]">
                          <p className="text-[10px] font-semibold text-gray-400 mb-1 ml-1">Fuzzy Bloom</p>
                          <div className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed">
                            {msg.reply}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          <span className="text-xs text-gray-400 ml-1">Waiting for reply...</span>
                        </div>
                      </div>
                    )}

                    {/* USER FOLLOW-UP REPLY — right */}
                    {msg.user_reply && (
                      <div className="flex justify-end">
                        <div className="max-w-[78%]">
                          <div className="bg-[#4b2e2e] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                            {msg.user_reply}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 text-right">
                            You · {msg.user_reply_at ? new Date(msg.user_reply_at).toLocaleString() : ""}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* REPLY INPUT — only show after admin replied and no user_reply yet */}
                    {msg.reply && !msg.user_reply && replyTarget !== msg.id && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => { setReplyTarget(msg.id); setReplyText("") }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#4b2e2e]/20 text-xs font-semibold text-[#4b2e2e] hover:bg-[#4b2e2e]/5 transition"
                        >
                          <Send size={11} /> Reply
                        </button>
                      </div>
                    )}

                    {replyTarget === msg.id && (
                      <div className="pt-1 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          rows={3}
                          autoFocus
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setReplyTarget(null)}
                            className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition">
                            Cancel
                          </button>
                          <button onClick={() => sendUserReply(msg.id)} disabled={sending || !replyText.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4b2e2e] text-white text-xs font-semibold hover:bg-[#3a2323] transition disabled:opacity-60">
                            <Send size={11} /> {sending ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div ref={bottomRef} />
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
