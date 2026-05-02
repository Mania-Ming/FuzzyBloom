"use client"

import { useEffect, useState, useRef } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase"
import { MessageSquare, Send, Trash2 } from "lucide-react"
import ConfirmModal from "@/components/admin/ConfirmModal"
import Toast, { ToastType } from "@/components/admin/Toast"

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
}

function formatTime(ts: string) {
  const d = new Date(ts)
  const isToday = d.toDateString() === new Date().toDateString()
  if (isToday) return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function UserMessagesPage() {
  const [userId, setUserId]   = useState<string | null>(null)
  const [convId, setConvId]   = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]     = useState("")
  const [sending, setSending]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [toast, setToast]             = useState<ToastType>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Step 1: get user → find or create conversation
  useEffect(() => {
    async function init() {
      setLoading(true)
      setError(null)

      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        setError("You must be logged in to use chat.")
        setLoading(false)
        return
      }
      setUserId(user.id)

      // Try to find existing conversation
      const { data: existing, error: selErr } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (selErr) {
        console.error("conversations select error:", selErr)
        setError("Failed to load chat: " + selErr.message)
        setLoading(false)
        return
      }

      if (existing) {
        setConvId(existing.id)
        setLoading(false)
        return
      }

      // Create new conversation
      const { data: created, error: insErr } = await supabase
        .from("conversations")
        .insert({ user_id: user.id })
        .select("id")
        .single()

      if (insErr || !created) {
        console.error("conversations insert error:", insErr)
        setError("Failed to start conversation: " + (insErr?.message ?? "unknown error"))
        setLoading(false)
        return
      }

      setConvId(created.id)
      setLoading(false)
    }
    init()
  }, [])

  // Step 2: load messages whenever convId is set
  useEffect(() => {
    if (!convId) return
    loadMessages()
  }, [convId])

  async function loadMessages() {
    if (!convId) return
    const { data, error: err } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })

    if (err) { console.error("messages fetch error:", err); return }
    setMessages(data ?? [])
  }

  // Step 3: realtime subscription
  useEffect(() => {
    if (!convId) return
    const ch = supabase
      .channel("user-chat-" + convId)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${convId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [convId])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function deleteConversation() {
    if (!convId) return
    const { error: msgErr } = await supabase.from("messages").delete().eq("conversation_id", convId)
    if (msgErr) { setToast({ message: "Failed to delete messages", type: "error" }); setShowDeleteModal(false); return }
    const { error: convErr } = await supabase.from("conversations").delete().eq("id", convId)
    if (convErr) { setToast({ message: "Failed to delete conversation", type: "error" }); setShowDeleteModal(false); return }
    setConvId(null)
    setMessages([])
    setShowDeleteModal(false)
    setToast({ message: "Conversation deleted", type: "success" })
  }

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed) return
    if (!userId || !convId) { alert("Chat not ready yet, please wait."); return }

    setSending(true)
    const { error: err } = await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: userId,
      message: trimmed,
    })
    if (err) {
      console.error("send message error:", err)
      alert("Failed to send: " + err.message)
    } else {
      setInput("")
    }
    setSending(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navbar />
        <Toast toast={toast} onClose={() => setToast(null)} />
        {showDeleteModal && (
          <ConfirmModal
            message="Are you sure you want to delete this conversation? All messages will be lost."
            onConfirm={deleteConversation}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col">

          {error && (
            <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 shrink-0">
              {error}
            </div>
          )}

          {/* Chat box — fills remaining height, nothing outside scrolls */}
          <div className="h-[500px] bg-white rounded-3xl border border-[#e8d5d5] shadow-sm flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xs font-bold">
                  FB
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">FuzzyBloom</p>
                  <p className="text-xs text-gray-400">We typically reply within a few hours</p>
                </div>
              </div>
              {convId && messages.length > 0 && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>

            {/* Messages — only this scrolls */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 min-h-0">
              {loading && (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-4 border-[#4b2e2e] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && !error && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare size={40} className="text-gray-200 mb-3" />
                  <p className="font-semibold text-gray-400">No messages yet</p>
                  <p className="text-xs text-gray-300 mt-1">Send a message to start the conversation</p>
                </div>
              )}

              {messages.map(msg => {
                const isMe = msg.sender_id === userId
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mr-2 mt-auto">
                        FB
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-[#4b2e2e] text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                        {msg.message}
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                        {formatTime(msg.created_at)}
                        {isMe && msg.is_read && <span className="ml-1 text-blue-400">· Seen</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input — sticky at bottom */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={loading ? "Loading chat..." : "Type a message..."}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:bg-gray-50 focus:ring-2 focus:ring-[#4b2e2e]/20 transition disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending || loading}
                className="w-10 h-10 rounded-full bg-[#4b2e2e] text-white flex items-center justify-center hover:bg-[#3a2323] transition disabled:opacity-40 shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
