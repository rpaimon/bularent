"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { ArrowLeft, BadgeCheck, Bath, Bed, Flag, Loader2, MapPin, MessageCircle, Phone, ShieldAlert } from "lucide-react"
import { demoProperties } from "@/lib/demo-data"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Property } from "@/lib/types"
import { useAuth } from "@/hooks/useAuth"

export default function PropertyDetail({ id }: { id: string }) {
  const { user } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState("suspected_scam")
  const [details, setDetails] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function load() {
      const demo = demoProperties.find((item) => item.id === id)
      if (!isSupabaseConfigured) { setProperty(demo ?? null); setLoading(false); return }
      // RLS exposes approved listings publicly and private statuses only to owners/admins.
      const { data } = await supabase.from("properties").select("*").eq("id", id).single()
      setProperty((data as Property | null) ?? null); setLoading(false)
    }
    void load()
  }, [id])

  async function report(event: FormEvent) {
    event.preventDefault()
    if (!user) { setMessage("Please sign in before submitting a report."); return }
    const { error } = await supabase.from("reports").insert({ property_id: id, reporter_id: user.id, reason, details: details || null })
    if (error) setMessage(error.message)
    else { setMessage("Report received. Our team will review it."); setDetails("") }
  }

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-[#0d7c79]" /></div>
  if (!property) return <div className="mx-auto min-h-[60vh] max-w-3xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Listing not available</h1><p className="mt-3 text-slate-600">It may have been rented, archived or removed.</p><Link href="/properties" className="mt-6 inline-block font-semibold text-[#0d6f6b]">Browse current rentals</Link></div>

  const whatsapp = property.whatsapp_phone?.replace(/\D/g, "")
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d6f6b]"><ArrowLeft className="h-4 w-4" /> Back to rentals</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="relative h-[320px] overflow-hidden rounded-2xl bg-slate-100 sm:h-[480px]"><Image src={property.images[0] || "/placeholder.svg"} alt={property.title} fill className="object-cover" priority /></div>
          <div className="mt-7 flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2">{property.verified && <span className="inline-flex items-center gap-1 rounded-full bg-[#dff4ef] px-3 py-1 text-xs font-bold text-[#075e5b]"><BadgeCheck className="h-4 w-4" /> Verified listing</span>}<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{property.property_type}</span></div><h1 className="mt-3 text-3xl font-black md:text-4xl">{property.title}</h1><p className="mt-2 flex items-center gap-1 text-slate-600"><MapPin className="h-4 w-4" /> {property.address}, {property.city}</p></div><p className="text-3xl font-black text-[#0d6f6b]">FJD ${property.rent_amount.toLocaleString()}<span className="block text-right text-sm font-normal text-slate-500">per month</span></p></div>
          <div className="mt-7 flex gap-8 border-y py-5"><span className="flex items-center gap-2 font-semibold"><Bed className="h-5 w-5 text-[#0d7c79]" /> {property.bedrooms} bedrooms</span><span className="flex items-center gap-2 font-semibold"><Bath className="h-5 w-5 text-[#0d7c79]" /> {property.bathrooms} bathrooms</span></div>
          <section className="mt-8"><h2 className="text-xl font-bold">About this property</h2><p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{property.description}</p></section>
          {!!property.amenities.length && <section className="mt-8"><h2 className="text-xl font-bold">Features</h2><div className="mt-3 flex flex-wrap gap-2">{property.amenities.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-sm">{item}</span>)}</div></section>}
        </div>
        <aside className="h-fit rounded-2xl border bg-white p-6 shadow-lg lg:sticky lg:top-24">
          <p className="text-sm text-slate-500">Listed by</p><p className="mt-1 font-bold">Property owner or agent</p>
          <div className="mt-6 grid gap-3">{property.contact_phone && <a href={`tel:${property.contact_phone}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f15a24] font-bold text-white"><Phone className="h-5 w-5" /> Call owner</a>}{whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello, I am interested in ${property.title} on BulaRent.`)}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white"><MessageCircle className="h-5 w-5" /> WhatsApp</a>}</div>
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><p className="flex items-center gap-2 font-bold"><ShieldAlert className="h-5 w-5" /> Stay safe</p><p className="mt-1">View the property and confirm who owns or manages it before paying.</p></div>
          <button onClick={() => setReportOpen(!reportOpen)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-700"><Flag className="h-4 w-4" /> Report this listing</button>
          {reportOpen && <form onSubmit={report} className="mt-4 grid gap-3 border-t pt-4"><select value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 rounded-lg border px-2 text-sm"><option value="suspected_scam">Suspected scam</option><option value="duplicate">Duplicate listing</option><option value="incorrect_information">Incorrect information</option><option value="already_rented">Already rented</option></select><textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} placeholder="Add useful details" className="min-h-24 rounded-lg border p-3 text-sm" /><button className="h-10 rounded-lg bg-red-700 text-sm font-bold text-white">Submit report</button>{message && <p className="text-sm text-slate-700">{message}</p>}</form>}
        </aside>
      </div>
    </div>
  )
}
