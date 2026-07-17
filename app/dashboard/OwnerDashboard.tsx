"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { Bell, Building2, Loader2, Mail, Pencil, Plus, RefreshCw, UserRound } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Property } from "@/lib/types"

type Notification = { id: string; title: string; message: string; link?: string | null; read: boolean; created_at: string }

export default function OwnerDashboard() {
  const { user, profile, loading: authLoading, updateProfile } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  async function load() {
    if (!user || !isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)
    const [listingResult, notificationResult] = await Promise.all([
      supabase.from("properties").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    ])
    setProperties((listingResult.data as Property[]) ?? [])
    setNotifications((notificationResult.data as Notification[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [user])
  useEffect(() => { setName(profile?.full_name ?? ""); setPhone(profile?.phone ?? "") }, [profile])

  async function setStatus(id: string, status: "rented" | "archived") {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id)
    setMessage(error ? error.message : `Listing marked ${status}.`)
    if (!error) void load()
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    const { error } = await updateProfile({ full_name: name.trim(), phone: phone.trim() || null })
    setMessage(error ? error.message : "Your account details were saved.")
  }

  async function readNotifications() {
    if (!user) return
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)
    setMessage(error ? error.message : "Notifications marked as read.")
    if (!error) void load()
  }

  if (authLoading || loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!user) return <div className="mx-auto min-h-[60vh] max-w-xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Your BulaRent dashboard</h1><p className="mt-4 text-slate-600">Sign in to manage listings, messages, account details and updates.</p><Link href="/login" className="mt-6 inline-block rounded-xl bg-[#f15a24] px-6 py-3 font-bold text-white">Sign in</Link></div>

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-semibold text-[#0d7c79]">Welcome, {profile?.full_name}</p><h1 className="mt-1 text-4xl font-black">Your dashboard</h1></div><div className="flex gap-2"><Link href="/messages" className="inline-flex h-11 items-center gap-2 rounded-xl border px-5 font-bold"><Mail className="h-5 w-5" /> Messages</Link><Link href="/submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#f15a24] px-5 font-bold text-white"><Plus className="h-5 w-5" /> New listing</Link></div></div>
      {message && <p role="status" className="mt-5 rounded-xl bg-[#eef9f6] p-4 text-sm text-[#07384d]">{message}</p>}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border bg-white p-6"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold"><Building2 className="h-5 w-5 text-[#0d7c79]" /> Your listings ({properties.length})</h2><button onClick={() => void load()} aria-label="Refresh dashboard"><RefreshCw className="h-4 w-4" /></button></div>
          {properties.length ? <div className="mt-5 grid gap-4">{properties.map((property) => <article key={property.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{property.status.replace("_", " ")}</p><h3 className="mt-1 font-bold">{property.title}</h3><p className="mt-1 text-sm text-slate-600">{property.city} · FJD ${property.rent_amount.toLocaleString()}/month · {property.images.length} photo{property.images.length === 1 ? "" : "s"}</p>{property.rejection_reason && <p className="mt-2 text-sm text-red-700">Review note: {property.rejection_reason}</p>}</div><div className="flex flex-wrap gap-2"><Link href={`/properties/${property.id}`} className="rounded-lg border px-3 py-2 text-xs font-semibold">View</Link><Link href={`/dashboard/listings/${property.id}/edit`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><Pencil className="h-3.5 w-3.5" /> Edit</Link>{property.status === "approved" && <button onClick={() => void setStatus(property.id, "rented")} className="rounded-lg border px-3 py-2 text-xs font-semibold">Mark rented</button>}{["draft", "rejected", "rented"].includes(property.status) && <button onClick={() => void setStatus(property.id, "archived")} className="rounded-lg border px-3 py-2 text-xs font-semibold">Archive</button>}</div></div></article>)}</div> : <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-slate-600">You have no listings yet. Create your first one above.</p>}
        </section>
        <div className="grid content-start gap-6">
          <aside className="rounded-2xl border bg-white p-6"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold"><Bell className="h-5 w-5 text-[#0d7c79]" /> Notifications</h2>{notifications.some((note) => !note.read) && <button onClick={() => void readNotifications()} className="text-xs font-bold text-[#0d6f6b]">Mark all read</button>}</div>{notifications.length ? <div className="mt-5 grid gap-3">{notifications.map((note) => { const body = <><p className="text-sm font-bold">{note.title}</p><p className="mt-1 text-sm text-slate-600">{note.message}</p></>; return note.link ? <Link key={note.id} href={note.link} className={`block rounded-xl p-4 ${note.read ? "bg-slate-50" : "bg-[#eef9f6]"}`}>{body}</Link> : <div key={note.id} className={`rounded-xl p-4 ${note.read ? "bg-slate-50" : "bg-[#eef9f6]"}`}>{body}</div> })}</div> : <p className="mt-5 text-sm text-slate-500">No notifications yet.</p>}</aside>
          <section className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><UserRound className="h-5 w-5 text-[#0d7c79]" /> Account settings</h2><form onSubmit={saveProfile} className="mt-5 grid gap-4"><label className="grid gap-1.5 text-sm font-semibold">Full name<input required value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-lg border px-3 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-11 rounded-lg border px-3 font-normal" /></label><p className="text-xs text-slate-500">Account type: {profile?.role}</p><button className="h-11 rounded-xl bg-slate-900 font-bold text-white">Save account</button></form></section>
        </div>
      </div>
    </div>
  )
}
