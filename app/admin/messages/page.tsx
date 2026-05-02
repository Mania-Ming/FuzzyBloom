"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { MessageSquare, Send, User } from "lucide-react"

type Conversation = {
  id: string
  user_id: string
  created_at: string
  profiles?: { full_name: string; email: string } | null
  last_message?: string
  last_message_at?: string
  unread_count?: number
}

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
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected]           = useState<Conversation | null>(null)
  const [messages, setMessages]           = useState<Message[]>([])
  const [input, setInput]                 = useState("")
  const [adminId, setAdminId]             = useState<string | null>(null)
  const [sending, setSending]             = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Get current admin user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAdminId(data.user?.id ?? null))
  }, [])

  const loadConversations = useCallback(async () => {
    const { data: convs } = await supabase
      .from("conversations")
      .select("id, user_id, created_at")
      .order("created_at", { ascending: false })

    if (!convs?.length) { setConversations([]); return }

    // Fetch profiles for each user
    const userIds = [...new Set(convs.map(c => c.user_id))]
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds)

    const profileMap: Record<string, any> = {}
    for (const p of profiles ?? []) profileMap[p.id] = p

    // Fetch last message + unread count per conversation
    const enriched = await Promise.all(convs.map(async (c) => {
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("message, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count: unread } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .eq("is_read", false)
        .neq("sender_id", adminId ?? "")

      return {
        ...c,
        profiles: profileMap[c.user_id] ?? null,
        last_message: lastMsg?.message ?? "",
        last_message_at: lastMsg?.created_at ?? c.created_at,
        unread_count: unread ?? 0,
      }
    }))

    enriched.sort((a, b) => new Date(b.last_message_at!).getTime() - new Date(a.last_message_at!).getTime())
    setConversations(enriched)
  }, [adminId])

  useEffect(() => {
    if (adminId) loadConversations()
  }, [adminId, loadConversations])

  // Realtime: new conversations or messages
  useEffect(() => {
    const ch = supabase
      .channel("admin-msg-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, loadConversations)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, loadConversations)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [loadConversations])

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
    setMessages(data ?? [])

    // Mark unread messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", convId)
      .eq("is_read", false)
      .neq("sender_id", adminId ?? "")
  }, [adminId])

  useEffect(() => {
    if (!selected) return
    loadMessages(selected.id)

    const ch = supabase
      .channel("admin-chat-" + selected.id)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${selected.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        // Mark as read if from user
        if (payload.new.sender_id !== adminId) {
          supabase.from("messages").update({ is_read: true }).eq("id", payload.new.id)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [selected, loadMessages, adminId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !selected || !adminId) return
    setSending(true)
    await supabase.from("messages").insert({
      conversation_id: selected.id,
      sender_id: adminId,
      message: input.trim(),
    })
    setInput("")
    setSending(false)
    loadConversations()
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl border border-[#e8d5d5] shadow-sm overflow-hidden">

      {/* ── Conversation List ── */}
      <div className="w-72 shrink-0 border-r border-gray-100 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <MessageSquare size={18} className="text-[#4b2e2e]" />
          <h2 className="font-bold text-[#2a1515] text-base">Messages</h2>
          {conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0) > 0 && (
            <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0)}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageSquare size={32} className="text-gray-200 mb-2" />
              <p className="text-gray-400 text-sm">No conversations yet</p>
            </div>
          )}
          {conversations.map(conv => {
            const isActive = selected?.id === conv.id
            return (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition flex items-start gap-3 ${isActive ? "bg-[#fdf6f6]" : ""}`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {(conv.profiles?.full_name ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {conv.profiles?.full_name ?? "Unknown"}
                    </p>
                    {conv.last_message_at && (
                      <span className="text-[10px] text-gray-400 shrink-0">{formatTime(conv.last_message_at)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{conv.last_message || "No messages yet"}</p>
                </div>
                {(conv.unread_count ?? 0) > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Chat Area ── */}
      {!selected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <MessageSquare size={48} className="text-gray-200 mb-3" />
          <p className="font-semibold text-gray-400">Select a conversation</p>
          <p className="text-xs text-gray-300 mt-1">Choose a user from the left to start chatting</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-xs font-bold">
              {(selected.profiles?.full_name ?? "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{selected.profiles?.full_name ?? "Unknown"}</p>
              <p className="text-xs text-gray-400">{selected.profiles?.email ?? ""}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300 text-sm">No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map(msg => {
              const isAdmin = msg.sender_id === adminId
              return (
                <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                  {!isAdmin && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4b2e2e] to-[#c084a0] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mr-2 mt-auto">
                      {(selected.profiles?.full_name ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-[65%] group`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isAdmin
                        ? "bg-[#4b2e2e] text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}>
                      {msg.message}
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-1 ${isAdmin ? "text-right" : "text-left"}`}>
                      {formatTime(msg.created_at)}
                      {isAdmin && msg.is_read && <span className="ml-1 text-blue-400">· Seen</span>}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:bg-gray-50 focus:ring-2 focus:ring-[#4b2e2e]/20 transition"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-full bg-[#4b2e2e] text-white flex items-center justify-center hover:bg-[#3a2323] transition disabled:opacity-40 shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
