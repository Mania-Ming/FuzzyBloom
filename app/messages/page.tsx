"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"
import { MessageCircle, Send, Package, Trash2 } from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"

type Message = {
  id: string
  message: string
  reply: string | null
  is_read: boolean
  created_at: string
  product_id: string | null
  products: { name: string; image_url: string | null } | null
}

type Thread = {
  product_id: string | null
  product: { name: string; image_url: string | null } | null
  messages: Message[]
}

export default function MessagesPage() {
  const { data: user } = useMe()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState("")
  const [toast, setToast] = useState<ToastType>(null)
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, message, reply, is_read, created_at, product_id, products:product_id(name, image_url)")
      .eq("sender_id", userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Messages error:", error.message)
      setLoading(false)
      return
    }

    const msgs = (data as Message[] | null) ?? []
    const threadMap = new Map<string, Thread>()
    for (const msg of msgs) {
      const key = msg.product_id ?? "no-product"
      if (!threadMap.has(key)) {
        threadMap.set(key, {
          product_id: msg.product_id,
          product: msg.products,
          messages: [],
        })
      }
      threadMap.get(key)!.messages.push(msg)
    }
    setThreads(Array.from(threadMap.values()))
    setLoading(false)

    const newReplies = msgs.filter((m: Message) => m.reply && !m.is_read)
    if (newReplies.length > 0) {
      setToastMsg(`You have ${newReplies.length} new repl${newReplies.length > 1 ? "ies" : "y"} from the seller!`)
      setTimeout(() => setToastMsg(""), 4000)
      const ids = newReplies.map((m: Message) => m.id)
      await supabase.from("messages").update({ is_read: true }).in("id", ids)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return
    const initialLoad = setTimeout(() => {
      void load(user.id)
    }, 0)
    const channel = supabase
      .channel("user-messages-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` }, () => load(user.id))
      .subscribe()
    return () => {
      clearTimeout(initialLoad)
      supabase.removeChannel(channel)
    }
  }, [user?.id, load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [threads])

  async function sendReply(productId: string | null) {
    if (!replyText.trim() || !user?.id) return
    setSending(true)
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      product_id: productId,
      message: replyText.trim(),
      is_read: false,
    })
    if (!error) {
      setReplyText("")
      setReplyTarget(null)
      load(user.id)
    }
    setSending(false)
  }

  async function deleteMessage() {
    if (!deleteTarget || !user?.id) return
    const target = deleteTarget
    setDeleteTarget(null)

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", target.id)
      .eq("sender_id", user.id)

    if (error) {
      setToast({ message: "Failed to delete message.", type: "error" })
      return
    }

    if (replyTarget === (target.product_id ?? "no-product")) {
      setReplyTarget(null)
      setReplyText("")
    }
    setToast({ message: "Message deleted.", type: "success" })
    load(user.id)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <Toast toast={toast} onClose={() => setToast(null)} />
        {deleteTarget && (
          <ConfirmModal
            message={`Delete this message${deleteTarget.reply ? " and the seller reply attached to it" : ""}? This cannot be undone.`}
            onConfirm={deleteMessage}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#2a1515] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium fade-up flex items-center gap-2">
            <MessageCircle size={15} /> {toastMsg}
          </div>
        )}

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-8 py-8">
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

          {!loading && threads.length === 0 && (
            <div className="bg-white/80 rounded-3xl border border-white/60 py-20 text-center">
              <MessageCircle size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Send a message from any product page</p>
            </div>
          )}

          <div className="space-y-6">
            {threads.map((thread) => {
              const product = thread.product
              const threadKey = thread.product_id ?? "no-product"
              return (
                <div key={threadKey} className="bg-white/90 rounded-3xl border border-white/60 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3 bg-[#fdf6f0] border-b border-[#e8d5d5]">
                    {product?.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={36}
                        height={36}
                        className="rounded-xl object-cover border border-white shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-pink-300" />
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">About</p>
                      <p className="text-sm font-semibold text-[#2a1515] leading-tight">{product?.name ?? "General Inquiry"}</p>
                    </div>
                  </div>

                  <div className="px-4 py-4 space-y-3">
                    {thread.messages.map((msg) => (
                      <div key={msg.id} className="space-y-3">
                        <div className="flex justify-end">
                          <div className="max-w-[78%]">
                            <div className="bg-[#4b2e2e] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                              {msg.message}
                            </div>
                            <div className="mt-1 flex items-center justify-end gap-2">
                              <button
                                onClick={() => setDeleteTarget(msg)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400 hover:text-red-500 transition"
                              >
                                <Trash2 size={10} /> Delete
                              </button>
                              <p className="text-[10px] text-gray-400 text-right">
                                You · {new Date(msg.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

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
                          msg.id === thread.messages[thread.messages.length - 1].id && (
                            <div className="flex justify-start">
                              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                <span className="text-xs text-gray-400 ml-1">Waiting for reply...</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ))}

                    {replyTarget === threadKey ? (
                      <div className="pt-2 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write your message..."
                          rows={3}
                          autoFocus
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(thread.product_id) } }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setReplyTarget(null); setReplyText("") }}
                            className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => sendReply(thread.product_id)}
                            disabled={sending || !replyText.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4b2e2e] text-white text-xs font-semibold hover:bg-[#3a2323] transition disabled:opacity-60"
                          >
                            <Send size={11} /> {sending ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => { setReplyTarget(threadKey); setReplyText("") }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#4b2e2e]/20 text-xs font-semibold text-[#4b2e2e] hover:bg-[#4b2e2e]/5 transition"
                        >
                          <Send size={11} /> Reply
                        </button>
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
