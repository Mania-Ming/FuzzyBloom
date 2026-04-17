"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { useMe } from "@/lib/hooks/useMe"
import { MessageCircle, Send, Package, Trash2, ChevronDown, ChevronUp } from "lucide-react"
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
  hasUnread: boolean
}

export default function MessagesPage() {
  const { data: user } = useMe()
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType>(null)
  const [openThread, setOpenThread] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ threadKey: string; productId: string | null } | null>(null)

  const load = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, message, reply, is_read, created_at, product_id, products:product_id(name, image_url)")
      .eq("sender_id", userId)
      .order("created_at", { ascending: true })

    if (error) { console.error("Messages error:", error.message); setLoading(false); return }

    const msgs = (data as any[]) ?? []
    const threadMap = new Map<string, Thread>()
    for (const msg of msgs) {
      const key = msg.product_id ?? "no-product"
      if (!threadMap.has(key)) {
        threadMap.set(key, { product_id: msg.product_id, product: msg.products, messages: [], hasUnread: false })
      }
      const t = threadMap.get(key)!
      t.messages.push(msg)
      if (msg.reply && !msg.is_read) t.hasUnread = true
    }
    const threadList = Array.from(threadMap.values())
    setThreads(threadList)
    setLoading(false)

    // Auto-open first thread with unread
    const unreadThread = threadList.find(t => t.hasUnread)
    if (unreadThread) setOpenThread(unreadThread.product_id ?? "no-product")

    // Mark unread as read
    const unreadIds = msgs.filter((m: Message) => m.reply && !m.is_read).map((m: Message) => m.id)
    if (unreadIds.length > 0) {
      setToast({ message: `${unreadIds.length} new repl${unreadIds.length > 1 ? "ies" : "y"} from the seller!`, type: "success" })
      await supabase.from("messages").update({ is_read: true }).in("id", unreadIds)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return
    load(user.id)
    const channel = supabase
      .channel("user-messages-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` },
        () => load(user.id))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, load])

  async function sendReply(productId: string | null) {
    if (!replyText.trim() || !user?.id) return
    setSending(true)
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      product_id: productId,
      message: replyText.trim(),
      is_read: false,
    })
    if (!error) { setReplyText(""); load(user.id) }
    setSending(false)
  }

  async function handleDeleteConversation() {
    if (!deleteTarget || !user?.id) return
    const { productId } = deleteTarget
    setDeleteTarget(null)

    const query = productId
      ? supabase.from("messages").delete().eq("sender_id", user.id).eq("product_id", productId)
      : supabase.from("messages").delete().eq("sender_id", user.id).is("product_id", null)

    const { error } = await query
    if (error) { setToast({ message: "Failed to delete conversation.", type: "error" }); return }
    setToast({ message: "Conversation deleted.", type: "success" })
    setOpenThread(null)
    load(user.id)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <Toast toast={toast} onClose={() => setToast(null)} />
        {deleteTarget && (
          <ConfirmModal
            message="Delete this entire conversation? All messages will be permanently removed."
            onConfirm={handleDeleteConversation}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-8 py-8">
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-10 h-10 rounded-2xl bg-[#4b2e2e]/10 flex items-center justify-center">
              <MessageCircle size={20} className="text-[#4b2e2e]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2a1515]">My Messages</h1>
              <p className="text-gray-400 text-xs mt-0.5">{threads.length} conversation{threads.length !== 1 ? "s" : ""} with Fuzzy Bloom</p>
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

          {/* ACCORDION THREADS */}
          <div className="space-y-3">
            {threads.map((thread) => {
              const product = thread.product as any
              const threadKey = thread.product_id ?? "no-product"
              const isOpen = openThread === threadKey
              const lastMsg = thread.messages[thread.messages.length - 1]

              return (
                <div key={threadKey} className={`bg-white/90 rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${thread.hasUnread ? "border-[#4b2e2e]/30" : "border-white/60"}`}>

                  {/* ACCORDION HEADER — click to open/close */}
                  <button
                    onClick={() => setOpenThread(isOpen ? null : threadKey)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-[#fdf6f0] hover:bg-[#f5ece6] transition text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {product?.image_url ? (
                        <Image src={product.image_url} alt={product.name} width={34} height={34}
                          className="rounded-xl object-cover border border-white shadow-sm shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                          <Package size={15} className="text-pink-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2a1515] truncate">{product?.name ?? "General Inquiry"}</p>
                        <p className="text-[10px] text-gray-400 truncate">{lastMsg?.message?.slice(0, 50)}{(lastMsg?.message?.length ?? 0) > 50 ? "..." : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {thread.hasUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#4b2e2e]" />
                      )}
                      <span className="text-xs text-gray-400">{thread.messages.length} msg{thread.messages.length !== 1 ? "s" : ""}</span>
                      {isOpen ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* EXPANDED CHAT */}
                  {isOpen && (
                    <div className="px-4 py-4 space-y-3">

                      {/* CHAT BUBBLES */}
                      {thread.messages.map((msg) => (
                        <div key={msg.id} className="space-y-2">
                          {/* User message — right */}
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

                          {/* Admin reply — left */}
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

                      {/* REPLY INPUT */}
                      <div className="pt-2 space-y-2 border-t border-gray-100 mt-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write your message..."
                          rows={2}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(thread.product_id) } }}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setDeleteTarget({ threadKey, productId: thread.product_id })}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition font-medium"
                          >
                            <Trash2 size={11} /> Delete Conversation
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
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
