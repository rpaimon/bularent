"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { Loader2, MessageCircle, Send } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import type { Conversation, Message } from "@/lib/types"

export default function MessagesCenter() {
  const params = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState(params.get("conversation"))
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("")

  async function loadConversations() {
    if (!user) return
    const { data } = await supabase.from("conversations").select("*, properties:property_id(id,title,images)").order("last_message_at", { ascending: false })
    const rows = (data as Conversation[]) ?? []
    setConversations(rows)
    if (!selected && rows[0]) setSelected(rows[0].id)
    setLoading(false)
  }

  async function loadMessages(conversationId: string) {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at")
    setMessages((data as Message[]) ?? [])
    if (user) await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("conversation_id", conversationId).neq("sender_id", user.id).is("read_at", null)
  }

  useEffect(() => { if (user) void loadConversations(); else if (!authLoading) setLoading(false) }, [user, authLoading])
  useEffect(() => { if (selected) void loadMessages(selected) }, [selected])

  async function send(event: FormEvent) {
    event.preventDefault(); setStatus("")
    if (!user || !selected || !body.trim()) return
    const { error } = await supabase.from("messages").insert({ conversation_id: selected, sender_id: user.id, body: body.trim() })
    if (error) setStatus(error.message)
    else { setBody(""); await loadMessages(selected); await loadConversations() }
  }

  if (authLoading || loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!user) return <div className="mx-auto min-h-[60vh] max-w-xl px-4 py-20 text-center"><MessageCircle className="mx-auto h-10 w-10 text-[#0d7c79]" /><h1 className="mt-5 text-3xl font-black">Sign in to view messages</h1><Link href="/login" className="mt-6 inline-block rounded-xl bg-[#f15a24] px-6 py-3 font-bold text-white">Sign in</Link></div>

  const active = conversations.find((item) => item.id === selected)
  return <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10"><p className="font-semibold text-[#0d7c79]">Your conversations</p><h1 className="mt-1 text-4xl font-black">Messages</h1><div className="mt-8 grid min-h-[560px] overflow-hidden rounded-2xl border bg-white shadow-sm md:grid-cols-[320px_1fr]">
    <aside className="border-b md:border-b-0 md:border-r"><div className="border-b p-4 font-bold">Conversations ({conversations.length})</div>{conversations.length ? conversations.map((conversation) => <button key={conversation.id} onClick={() => setSelected(conversation.id)} className={`flex w-full items-center gap-3 border-b p-4 text-left ${selected === conversation.id ? "bg-[#eef9f6]" : "hover:bg-slate-50"}`}><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100"><Image src={conversation.properties?.images?.[0] || "/placeholder.svg"} alt="Property" fill className="object-cover" /></div><div className="min-w-0"><p className="truncate font-bold">{conversation.properties?.title ?? "Property conversation"}</p><p className="mt-1 text-xs text-slate-500">Updated {new Date(conversation.last_message_at).toLocaleDateString()}</p></div></button>) : <p className="p-6 text-sm text-slate-500">No conversations yet. Open a property and send the owner a message.</p>}</aside>
    <section className="flex min-h-[500px] flex-col">{active ? <><div className="border-b p-4"><Link href={`/properties/${active.property_id}`} className="font-black text-[#07384d] hover:text-[#f15a24]">{active.properties?.title ?? "View property"}</Link></div><div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 sm:p-6">{messages.map((message) => <div key={message.id} className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.sender_id === user.id ? "bg-[#0d7c79] text-white" : "border bg-white text-slate-800"}`}><p>{message.body}</p><p className={`mt-1 text-[10px] ${message.sender_id === user.id ? "text-white/70" : "text-slate-400"}`}>{new Date(message.created_at).toLocaleString()}</p></div></div>)}</div><form onSubmit={send} className="flex gap-3 border-t p-4"><input required value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="Write a message…" className="h-12 flex-1 rounded-xl border px-4 outline-none focus:border-[#f15a24]" /><button className="grid h-12 w-12 place-items-center rounded-xl bg-[#f15a24] text-white"><Send className="h-5 w-5" /></button></form>{status && <p className="px-4 pb-3 text-sm text-red-700">{status}</p>}</> : <div className="grid flex-1 place-items-center p-8 text-center text-slate-500"><div><MessageCircle className="mx-auto h-10 w-10" /><p className="mt-3">Select a conversation to start messaging.</p></div></div>}</section>
  </div></div>
}
