"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Check, Flag, Loader2, ShieldCheck, X } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import type { Property, Report } from "@/lib/types"

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const [pending, setPending] = useState<Property[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  async function load() {
    if (!user || profile?.role !== "admin") { setLoading(false); return }
    setLoading(true)
    const [listingResult, reportResult] = await Promise.all([
      supabase.from("properties").select("*").eq("status", "pending_review").order("created_at"),
      supabase.from("reports").select("*, properties:property_id(title)").in("status", ["open", "reviewing"]).order("created_at"),
    ])
    setPending((listingResult.data as Property[]) ?? [])
    setReports((reportResult.data as Report[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { void load() }, [user, profile?.role])

  async function moderate(property: Property, status: "approved" | "rejected") {
    const reason = status === "rejected" ? window.prompt("Reason for rejection (required):")?.trim() : null
    if (status === "rejected" && !reason) return
    const { error } = await supabase.from("properties").update({ status, rejection_reason: reason, reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq("id", property.id)
    setMessage(error ? error.message : `Listing ${status}.`); if (!error) void load()
  }
  async function verify(property: Property) {
    const { error } = await supabase.from("properties").update({ verified: !property.verified }).eq("id", property.id)
    setMessage(error ? error.message : "Verification status updated."); if (!error) void load()
  }
  async function resolve(report: Report, status: "resolved" | "dismissed") {
    const { error } = await supabase.from("reports").update({ status, resolved_by: user?.id, resolved_at: new Date().toISOString() }).eq("id", report.id)
    setMessage(error ? error.message : `Report ${status}.`); if (!error) void load()
  }

  if (authLoading || loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!user || profile?.role !== "admin") return <div className="mx-auto min-h-[60vh] max-w-xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Administrator access required</h1><p className="mt-4 text-slate-600">This area is protected by both the interface and Supabase row-level security.</p><Link href="/login" className="mt-6 inline-block font-semibold text-[#0d6f6b]">Sign in with an admin account</Link></div>

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10"><p className="font-semibold text-[#0d7c79]">BulaRent operations</p><h1 className="mt-1 text-4xl font-black">Moderation dashboard</h1>{message && <p className="mt-5 rounded-xl bg-[#eef9f6] p-4 text-sm text-[#07384d]">{message}</p>}
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Pending listings ({pending.length})</h2><div className="mt-5 grid gap-4">{pending.length ? pending.map((property) => <article key={property.id} className="rounded-xl border p-4"><p className="text-xs text-slate-500">Submitted by {property.profiles?.full_name ?? "Unknown"}</p><h3 className="mt-1 font-bold">{property.title}</h3><p className="mt-1 text-sm text-slate-600">{property.address}, {property.city} · FJD ${property.rent_amount}/month</p><p className="mt-3 line-clamp-2 text-sm">{property.description}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/properties/${property.id}`} className="rounded-lg border px-3 py-2 text-xs font-semibold">Preview</Link><button onClick={() => void verify(property)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><ShieldCheck className="h-4 w-4" /> {property.verified ? "Remove verification" : "Mark verified"}</button><button onClick={() => void moderate(property, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Check className="h-4 w-4" /> Approve</button><button onClick={() => void moderate(property, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white"><X className="h-4 w-4" /> Reject</button></div></article>) : <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">The review queue is clear.</p>}</div></section>
        <section className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Flag className="h-5 w-5 text-red-700" /> Open reports ({reports.length})</h2><div className="mt-5 grid gap-4">{reports.length ? reports.map((report) => <article key={report.id} className="rounded-xl border p-4"><p className="text-xs font-bold uppercase text-red-700">{report.reason.replaceAll("_", " ")}</p><h3 className="mt-1 font-bold">{report.properties?.title ?? "Listing"}</h3>{report.details && <p className="mt-2 text-sm text-slate-600">{report.details}</p>}<div className="mt-4 flex gap-2"><button onClick={() => void resolve(report, "resolved")} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Resolve</button><button onClick={() => void resolve(report, "dismissed")} className="rounded-lg border px-3 py-2 text-xs font-semibold">Dismiss</button></div></article>) : <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">No open reports.</p>}</div></section>
      </div>
    </div>
  )
}
