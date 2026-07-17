"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, Building2, Loader2, Plus, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Property } from "@/lib/types"

type Notification = { id: string; title: string; message: string; read: boolean; created_at: string }

export default function OwnerDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  async function load() {
    if (!user || !isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)
    const [listingResult, notificationResult] = await Promise.all([
      supabase.from("properties").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ])
    setProperties((listingResult.data as Property[]) ?? [])
    setNotifications((notificationResult.data as Notification[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [user])

  async function setStatus(id: string, status: "rented" | "archived") {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id)
    setMessage(error ? error.message : `Listing marked ${status}.`)
    if (!error) void load()
  }

  if (authLoading || loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!user) return <div className="mx-auto min-h-[60vh] max-w-xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Your property dashboard</h1><p className="mt-4 text-slate-600">Sign in to manage listings and review updates.</p><Link href="/login" className="mt-6 inline-block rounded-xl bg-[#f15a24] px-6 py-3 font-bold text-white">Sign in</Link></div>

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-semibold text-[#0d7c79]">Welcome, {profile?.full_name}</p><h1 className="mt-1 text-4xl font-black">Property dashboard</h1></div><Link href="/submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#f15a24] px-5 font-bold text-white"><Plus className="h-5 w-5" /> New listing</Link></div>
      {message && <p className="mt-5 rounded-xl bg-[#eef9f6] p-4 text-sm text-[#07384d]">{message}</p>}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border bg-white p-6"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold"><Building2 className="h-5 w-5 text-[#0d7c79]" /> Your listings</h2><button onClick={() => void load()} title="Refresh"><RefreshCw className="h-4 w-4" /></button></div>
          {properties.length ? <div className="mt-5 grid gap-4">{properties.map((property) => <article key={property.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{property.status.replace("_", " ")}</p><h3 className="mt-1 font-bold">{property.title}</h3><p className="mt-1 text-sm text-slate-600">{property.city} · FJD ${property.rent_amount.toLocaleString()}/month</p>{property.rejection_reason && <p className="mt-2 text-sm text-red-700">Reason: {property.rejection_reason}</p>}</div><div className="flex gap-2">{property.status === "approved" && <button onClick={() => void setStatus(property.id, "rented")} className="rounded-lg border px-3 py-2 text-xs font-semibold">Mark rented</button>}{["draft", "rejected", "rented"].includes(property.status) && <button onClick={() => void setStatus(property.id, "archived")} className="rounded-lg border px-3 py-2 text-xs font-semibold">Archive</button>}</div></div></article>)}</div> : <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-slate-600">You have no listings yet.</p>}
        </section>
        <aside className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Bell className="h-5 w-5 text-[#0d7c79]" /> Notifications</h2>{notifications.length ? <div className="mt-5 grid gap-3">{notifications.map((note) => <div key={note.id} className={`rounded-xl p-4 ${note.read ? "bg-slate-50" : "bg-[#eef9f6]"}`}><p className="text-sm font-bold">{note.title}</p><p className="mt-1 text-sm text-slate-600">{note.message}</p></div>)}</div> : <p className="mt-5 text-sm text-slate-500">No notifications yet.</p>}</aside>
      </div>
    </div>
  )
}
