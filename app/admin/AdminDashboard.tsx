"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { Check, Flag, Home, Loader2, Settings, ShieldCheck, Star, Trash2, Users, X } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import type { ListingStatus, PlatformSettings, Profile, Property, Report, UserRole } from "@/lib/types"

type Tab = "overview" | "listings" | "reports" | "users" | "settings"

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [settings, setSettings] = useState<PlatformSettings>({ allow_submissions: true, announcement: "", support_email: "" })
  const [tab, setTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  async function load() {
    if (!user || profile?.role !== "admin") { setLoading(false); return }
    setLoading(true)
    const [listingResult, reportResult, userResult, settingsResult] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("reports").select("*, properties:property_id(id,title,status,images,owner_id)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_settings").select("allow_submissions,announcement,support_email").eq("id", true).maybeSingle(),
    ])
    setProperties((listingResult.data as Property[]) ?? [])
    setReports((reportResult.data as Report[]) ?? [])
    setUsers((userResult.data as Profile[]) ?? [])
    if (settingsResult.data) setSettings(settingsResult.data as PlatformSettings)
    setLoading(false)
  }
  useEffect(() => { void load() }, [user, profile?.role])

  async function updateListing(property: Property, updates: Partial<Property>, success: string) {
    const { error } = await supabase.from("properties").update(updates).eq("id", property.id)
    setMessage(error ? error.message : success)
    if (!error) void load()
  }

  async function moderate(property: Property, status: "approved" | "rejected") {
    const reason = status === "rejected" ? window.prompt("Tell the owner what must be fixed (required):")?.trim() : null
    if (status === "rejected" && !reason) return
    await updateListing(property, { status, rejection_reason: reason, reviewed_by: user?.id, reviewed_at: new Date().toISOString() } as Partial<Property>, `Listing ${status}. The owner will be notified.`)
  }

  async function setListingStatus(property: Property, status: ListingStatus) {
    await updateListing(property, { status }, `Listing status changed to ${status.replace("_", " ")}.`)
  }

  async function deleteListing(property: Property) {
    if (!window.confirm(`Permanently delete “${property.title}”? This cannot be undone.`)) return
    const { error } = await supabase.from("properties").delete().eq("id", property.id)
    setMessage(error ? error.message : "Listing permanently deleted.")
    if (!error) void load()
  }

  async function actionReport(report: Report, status: "reviewing" | "resolved" | "dismissed") {
    const adminMessage = window.prompt(`Message to the person who flagged this listing (${status}):`, status === "reviewing" ? "We are investigating your report and will update you after our review." : "We have completed our review. Thank you for helping keep BulaRent safe.")
    if (adminMessage === null) return
    const { error } = await supabase.rpc("admin_action_report", { p_report_id: report.id, p_status: status, p_message: adminMessage })
    setMessage(error ? error.message : `Report marked ${status}. The reporter was notified.`)
    if (!error) void load()
  }

  async function updateUser(account: Profile, updates: Partial<Pick<Profile, "role" | "verified" | "banned">>) {
    const next = { role: updates.role ?? account.role, verified: updates.verified ?? account.verified, banned: updates.banned ?? account.banned }
    const { error } = await supabase.rpc("admin_update_user", { p_user_id: account.id, p_role: next.role, p_verified: next.verified, p_banned: next.banned })
    setMessage(error ? error.message : `${account.full_name || account.email} was updated.`)
    if (!error) void load()
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault()
    const { error } = await supabase.from("platform_settings").update({ ...settings, updated_at: new Date().toISOString(), updated_by: user?.id }).eq("id", true)
    setMessage(error ? error.message : "Platform settings saved.")
  }

  if (authLoading || loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!user || profile?.role !== "admin") return <div className="mx-auto min-h-[60vh] max-w-xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Administrator access required</h1><p className="mt-4 text-slate-600">This area is protected by both the website and Supabase security rules.</p><Link href="/login" className="mt-6 inline-block font-semibold text-[#0d6f6b]">Sign in with an admin account</Link></div>

  const pending = properties.filter((item) => item.status === "pending_review")
  const openReports = reports.filter((item) => ["open", "reviewing"].includes(item.status))
  const tabs: { id: Tab; label: string }[] = [{ id: "overview", label: "Overview" }, { id: "listings", label: "All listings" }, { id: "reports", label: "Reports" }, { id: "users", label: "Users" }, { id: "settings", label: "Settings" }]

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10">
      <p className="font-semibold text-[#0d7c79]">BulaRent administration</p><h1 className="mt-1 text-4xl font-black">Operations control centre</h1>
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${tab === item.id ? "bg-slate-950 text-white" : "border bg-white"}`}>{item.label}</button>)}</nav>
      {message && <p role="status" className="mt-5 rounded-xl bg-[#eef9f6] p-4 text-sm text-[#07384d]">{message}</p>}

      {tab === "overview" && <div className="mt-8"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={<Home />} label="Total listings" value={properties.length} /><Stat icon={<ShieldCheck />} label="Waiting approval" value={pending.length} /><Stat icon={<Flag />} label="Open reports" value={openReports.length} /><Stat icon={<Users />} label="Registered users" value={users.length} /></div><section className="mt-8 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Priority work</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><button onClick={() => setTab("listings")} className="rounded-xl border p-5 text-left"><strong>{pending.length} listings need review</strong><p className="mt-1 text-sm text-slate-600">Preview, verify, approve or reject submissions.</p></button><button onClick={() => setTab("reports")} className="rounded-xl border p-5 text-left"><strong>{openReports.length} reports need attention</strong><p className="mt-1 text-sm text-slate-600">Investigate listings and update reporters.</p></button></div></section></div>}

      {tab === "listings" && <section className="mt-8 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">All listings ({properties.length})</h2><div className="mt-5 grid gap-4">{properties.map((property) => <article key={property.id} className="rounded-xl border p-4"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{property.status.replace("_", " ")} · {property.images.length} photos</p><h3 className="mt-1 font-bold">{property.title}</h3><p className="mt-1 text-sm text-slate-600">{property.city} · FJD ${property.rent_amount.toLocaleString()}/month</p></div><div className="flex flex-wrap items-center gap-2"><Link href={`/properties/${property.id}`} className="rounded-lg border px-3 py-2 text-xs font-semibold">Preview</Link><Link href={`/dashboard/listings/${property.id}/edit`} className="rounded-lg border px-3 py-2 text-xs font-semibold">Edit</Link><button onClick={() => void updateListing(property, { verified: !property.verified }, "Verification updated.")} className="rounded-lg border px-3 py-2 text-xs font-semibold">{property.verified ? "Unverify" : "Verify"}</button><button onClick={() => void updateListing(property, { featured: !property.featured }, "Homepage feature status updated.")} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><Star className="h-3.5 w-3.5" /> {property.featured ? "Unfeature" : "Feature"}</button>{property.status === "pending_review" && <><button onClick={() => void moderate(property, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Check className="h-3.5 w-3.5" /> Approve</button><button onClick={() => void moderate(property, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white"><X className="h-3.5 w-3.5" /> Reject</button></>}<select value={property.status} onChange={(event) => void setListingStatus(property, event.target.value as ListingStatus)} className="h-9 rounded-lg border px-2 text-xs font-semibold"><option value="draft">Draft</option><option value="pending_review">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="rented">Rented</option><option value="archived">Archived</option></select><button onClick={() => void deleteListing(property)} aria-label={`Delete ${property.title}`} className="rounded-lg border border-red-200 p-2 text-red-700"><Trash2 className="h-4 w-4" /></button></div></div></article>)}{!properties.length && <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">No listings yet.</p>}</div></section>}

      {tab === "reports" && <section className="mt-8 rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Flag className="h-5 w-5 text-red-700" /> Listing reports ({reports.length})</h2><div className="mt-5 grid gap-4">{reports.map((report) => <article key={report.id} className="rounded-xl border p-4"><p className="text-xs font-bold uppercase text-red-700">{report.status} · {report.reason.replaceAll("_", " ")}</p><h3 className="mt-1 font-bold">{report.properties?.title ?? "Deleted listing"}</h3>{report.details && <p className="mt-2 text-sm text-slate-600">Reporter’s note: {report.details}</p>}<div className="mt-4 flex flex-wrap gap-2">{report.properties && <Link href={`/properties/${report.property_id}`} className="rounded-lg border px-3 py-2 text-xs font-semibold">Preview listing</Link>}{report.status === "open" && <button onClick={() => void actionReport(report, "reviewing")} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950">Start investigation & notify</button>}{["open", "reviewing"].includes(report.status) && <><button onClick={() => void actionReport(report, "resolved")} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Resolve & message</button><button onClick={() => void actionReport(report, "dismissed")} className="rounded-lg border px-3 py-2 text-xs font-semibold">Dismiss & message</button></>}</div></article>)}{!reports.length && <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">No reports.</p>}</div></section>}

      {tab === "users" && <section className="mt-8 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Registered users ({users.length})</h2><div className="mt-5 grid gap-3">{users.map((account) => <article key={account.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><h3 className="font-bold">{account.full_name || "Unnamed user"}</h3><p className="text-sm text-slate-600">{account.email} · {account.role}{account.banned ? " · BANNED" : ""}</p></div><div className="flex flex-wrap gap-2"><select value={account.role} onChange={(event) => void updateUser(account, { role: event.target.value as UserRole })} className="h-9 rounded-lg border px-2 text-xs font-semibold"><option value="tenant">Renter</option><option value="landlord">Landlord</option><option value="agent">Agent</option><option value="admin">Admin</option></select><button onClick={() => void updateUser(account, { verified: !account.verified })} className="rounded-lg border px-3 py-2 text-xs font-semibold">{account.verified ? "Remove verification" : "Verify user"}</button><button onClick={() => void updateUser(account, { banned: !account.banned })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">{account.banned ? "Unban" : "Ban"}</button></div></article>)}</div></section>}

      {tab === "settings" && <section className="mt-8 max-w-2xl rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Settings className="h-5 w-5" /> Platform settings</h2><form onSubmit={saveSettings} className="mt-6 grid gap-5"><label className="flex items-center justify-between gap-4 rounded-xl border p-4"><span><strong>Allow new submissions</strong><span className="mt-1 block text-sm text-slate-600">Turn this off temporarily during maintenance.</span></span><input type="checkbox" checked={settings.allow_submissions} onChange={(event) => setSettings({ ...settings, allow_submissions: event.target.checked })} className="h-5 w-5" /></label><label className="grid gap-2 text-sm font-semibold">Homepage announcement<textarea value={settings.announcement} onChange={(event) => setSettings({ ...settings, announcement: event.target.value })} rows={3} className="rounded-xl border p-3 font-normal" placeholder="Leave blank for no announcement" /></label><label className="grid gap-2 text-sm font-semibold">Support email<input type="email" value={settings.support_email} onChange={(event) => setSettings({ ...settings, support_email: event.target.value })} className="h-11 rounded-xl border px-3 font-normal" /></label><button className="h-11 rounded-xl bg-slate-950 font-bold text-white">Save settings</button></form></section>}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl border bg-white p-5"><div className="h-5 w-5 text-[#0d7c79]">{icon}</div><p className="mt-4 text-3xl font-black">{value}</p><p className="text-sm text-slate-600">{label}</p></div>
}
