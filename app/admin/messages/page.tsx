"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { MessageCircle, Send, Trash2 } from "lucide-react"
import Toast, { ToastType } from "@/components/admin/Toast"
import ConfirmModal from "@/components/admin/ConfirmModal"

type Message = {
  id: string
  message: string
  created_at: string
  is_read: boolean
  reply: string | null
  user_reply?: string | null
  user_reply_at?: string | null
  sender_id: string
  product_id: string | null
  profiles: { full_name: string; email: string } | null
  products: { name: string } | null
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastType>(null)
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id, message, created_at, is_read, reply, sender_id, product_id, user_reply, user_reply_at,
        profiles:sender_id ( full_name, email ),
        products:product_id ( name )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Messages fetch error:", error.message)
      const { data: plain } = await supabase
        .from("messages")
        .select("id, message, created_at, is_read, reply, sender_id, product_id")
        .order("created_at", { ascending: false })
      setMessages((plain as Message[] | null) ?? [])
    } else {
      console.log("Messages loaded:", data?.length)
      setMessages((data as Message[] | null) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase.channel("admin-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => load())
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  async function markRead(id: string) {
    await supabase.from("messages").update({ is_read: true }).eq("id", id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

  async function sendReply(msgId: string) {
    if (!replyText.trim()) return
    setSending(true)
    const { error } = await supabase.from("messages").update({ reply: replyText.trim(), is_read: false }).eq("id", msgId)
    if (error) {
      setToast({ message: "Failed to send reply.", type: "error" })
    } else {
      setToast({ message: "Reply sent!", type: "success" })
      load()
    }
    setReplyText("")
    setReplyTarget(null)
    setSending(false)
  }

  async function deleteMessage() {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)

    const { error } = await supabase.from("messages").delete().eq("id", target.id)
    if (error) {
      setToast({ message: "Failed to delete message.", type: "error" })
      return
    }

    setMessages(prev => prev.filter(message => message.id !== target.id))
    if (replyTarget === target.id) {
      setReplyTarget(null)
      setReplyText("")
    }
    setToast({ message: "Message deleted.", type: "success" })
  }

  const unread = messages.filter(m => !m.is_read).length

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {deleteTarget && (
        <ConfirmModal
          message={`Delete this message${deleteTarget.reply ? " and its reply" : ""}? This cannot be undone.`}
          onConfirm={deleteMessage}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex items-center gap-2">
        <MessageCircle size={22} className="text-[#4b2e2e]" />
        <div>
          <h1 className="text-2xl font-bold text-[#2a1515]">Messages</h1>
          <p className="text-gray-400 text-sm">{messages.length} total · {unread} unread</p>
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" /></div>}

      {!loading && messages.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e8d5d5] py-16 text-center">
          <MessageCircle size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No messages yet</p>
        </div>
      )}

      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${!msg.is_read ? "border-[#4b2e2e]/30" : "border-[#e8d5d5]"}`}>
            <div className="px-6 py-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {msg.profiles?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{msg.profiles?.full_name ?? "Unknown"}</p>
                    <p className="text-xs text-gray-400">{msg.profiles?.email}</p>
                  </div>
                  {!msg.is_read && <span className="text-[10px] font-bold bg-[#4b2e2e] text-white px-2 py-0.5 rounded-full">New</span>}
                </div>
                <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</p>
              </div>

              {msg.product_id && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  🌸 About: <span className="font-medium text-gray-600">{msg.products?.name ?? "Unknown product"}</span>
                </p>
              )}

              <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">{msg.message}</div>

              {msg.reply && (
                <div className="mt-3 bg-[#4b2e2e]/5 border border-[#4b2e2e]/10 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-[#4b2e2e] mb-1">Your reply:</p>
                  <p className="text-sm text-gray-700">{msg.reply}</p>
                </div>
              )}

              {msg.user_reply && (
                <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Customer follow-up:</p>
                  <p className="text-sm text-gray-700">{msg.user_reply}</p>
                </div>
              )}

              <div className="flex gap-2 mt-3 flex-wrap">
                {!msg.is_read && (
                  <button onClick={() => markRead(msg.id)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition">
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(msg)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={11} /> Delete
                </button>
                {!msg.reply && (
                  <button onClick={() => { setReplyTarget(msg.id); setReplyText("") }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4b2e2e] text-white text-xs font-semibold hover:bg-[#3a2323] transition">
                    <Send size={11} /> Reply
                  </button>
                )}
                {msg.reply && (
                  <button onClick={() => { setReplyTarget(msg.id); setReplyText("") }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#4b2e2e]/20 text-xs font-semibold text-[#4b2e2e] hover:bg-[#4b2e2e]/5 transition">
                    <Send size={11} /> Reply Again
                  </button>
                )}
              </div>

              {replyTarget === msg.id && (
                <div className="mt-3 space-y-2">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your reply..." rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4b2e2e]/20 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setReplyTarget(null)} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-500">Cancel</button>
                    <button onClick={() => sendReply(msg.id)} disabled={sending || !replyText.trim()}
                      className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#4b2e2e] text-white text-xs font-semibold hover:bg-[#3a2323] transition disabled:opacity-60">
                      <Send size={11} /> {sending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
