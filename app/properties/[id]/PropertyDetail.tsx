"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { ArrowLeft, BadgeCheck, Bath, Bed, ChevronLeft, ChevronRight, Flag, Loader2, MapPin, MessageCircle, Phone, Send, ShieldAlert } from "lucide-react"
import { demoProperties } from "@/lib/demo-data"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Property } from "@/lib/types"
import { useAuth } from "@/hooks/useAuth"

export default function PropertyDetail({ id }: { id: string }) {
  const { user } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [photo, setPhoto] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState("suspected_scam")
  const [details, setDetails] = useState("")
  const [reportMessage, setReportMessage] = useState("")
  const [inquiry, setInquiry] = useState("")
  const [inquiryStatus, setInquiryStatus] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const demo = demoProperties.find((item) => item.id === id)
      if (!isSupabaseConfigured) { setProperty(demo ?? null); setLoading(false); return }
      const { data } = await supabase.from("properties").select("*").eq("id", id).single()
      setProperty((data as Property | null) ?? null); setLoading(false)
    }
    void load()
  }, [id])

  async function report(event: FormEvent) {
    event.preventDefault(); setReportMessage("")
    if (!user) { setReportMessage("Please sign in before submitting a report."); return }
    const { error } = await supabase.from("reports").insert({ property_id: id, reporter_id: user.id, reason, details: details || null })
    if (error) setReportMessage(error.code === "23505" ? "You already submitted this report." : error.message)
    else { setReportMessage("Report received. You will be notified when its status changes."); setDetails("") }
  }

  async function sendInquiry(event: FormEvent) {
    event.preventDefault(); setInquiryStatus("")
    if (!user) { setInquiryStatus("Please sign in to message the property owner."); return }
    const { data, error } = await supabase.rpc("start_conversation", { p_property_id: id, p_body: inquiry })
    if (error) setInquiryStatus(error.message)
    else { setConversationId(data as string); setInquiry(""); setInquiryStatus("Message sent successfully.") }
  }

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-[#0d7c79]" /></div>
  if (!property) return <div className="mx-auto min-h-[60vh] max-w-3xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Listing not available</h1><p className="mt-3 text-slate-600">It may have been rented, archived or removed.</p><Link href="/properties" className="mt-6 inline-block font-semibold text-[#0d6f6b]">Browse current rentals</Link></div>

  const images = property.images.length ? property.images : ["/placeholder.svg"]
  const whatsapp = property.whatsapp_phone?.replace(/\D/g, "")
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d6f6b]"><ArrowLeft className="h-4 w-4" /> Back to rentals</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="group relative h-[320px] overflow-hidden rounded-2xl bg-slate-100 sm:h-[500px]"><Image src={images[photo]} alt={`${property.title} — photo ${photo + 1}`} fill className="object-cover" priority />{images.length > 1 && <><button onClick={() => setPhoto((photo - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow" aria-label="Previous photo"><ChevronLeft /></button><button onClick={() => setPhoto((photo + 1) % images.length)} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow" aria-label="Next photo"><ChevronRight /></button><span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-1 text-sm font-bold text-white">{photo + 1} / {images.length}</span></>}</div>
          {images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">{images.map((image, index) => <button key={image} onClick={() => setPhoto(index)} className={`relative h-20 overflow-hidden rounded-xl border-2 ${photo === index ? "border-[#f15a24]" : "border-transparent"}`}><Image src={image} alt={`Photo ${index + 1}`} fill className="object-cover" /></button>)}</div>}
          <div className="mt-7 flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2">{property.verified && <span className="inline-flex items-center gap-1 rounded-full bg-[#dff4ef] px-3 py-1 text-xs font-bold text-[#075e5b]"><BadgeCheck className="h-4 w-4" /> Verified listing</span>}<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{property.property_type}</span></div><h1 className="mt-3 text-3xl font-black md:text-4xl">{property.title}</h1><p className="mt-2 flex items-center gap-1 text-slate-600"><MapPin className="h-4 w-4" /> {property.address}, {property.city}</p></div><p className="text-3xl font-black text-[#0d6f6b]">FJD ${property.rent_amount.toLocaleString()}<span className="block text-right text-sm font-normal text-slate-500">per month</span></p></div>
          <div className="mt-7 flex gap-8 border-y py-5"><span className="flex items-center gap-2 font-semibold"><Bed className="h-5 w-5 text-[#0d7c79]" /> {property.bedrooms} bedrooms</span><span className="flex items-center gap-2 font-semibold"><Bath className="h-5 w-5 text-[#0d7c79]" /> {property.bathrooms} bathrooms</span></div>
          <section className="mt-8"><h2 className="text-xl font-bold">About this property</h2><p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{property.description}</p></section>
          {!!property.amenities.length && <section className="mt-8"><h2 className="text-xl font-bold">Features</h2><div className="mt-3 flex flex-wrap gap-2">{property.amenities.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-sm">{item}</span>)}</div></section>}
        </div>
        <aside className="h-fit rounded-2xl border bg-white p-6 shadow-lg lg:sticky lg:top-24">
          <p className="text-sm text-slate-500">Listed by</p><p className="mt-1 font-bold">Property owner or agent</p>
          <div className="mt-6 grid gap-3">{property.contact_phone && <a href={`tel:${property.contact_phone}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f15a24] font-bold text-white"><Phone className="h-5 w-5" /> Call owner</a>}{whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello, I am interested in ${property.title} on BulaRent.`)}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white"><MessageCircle className="h-5 w-5" /> WhatsApp</a>}</div>
          <form onSubmit={sendInquiry} className="mt-5 grid gap-3 border-t pt-5"><label className="text-sm font-bold">Message through BulaRent</label><textarea required minLength={2} maxLength={2000} value={inquiry} onChange={(event) => setInquiry(event.target.value)} placeholder="Hello, is this property still available?" className="min-h-24 rounded-xl border p-3 text-sm" /><button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#07384d] text-sm font-bold text-white"><Send className="h-4 w-4" /> Send message</button>{inquiryStatus && <p className="text-sm text-slate-700">{inquiryStatus} {conversationId && <Link href={`/messages?conversation=${conversationId}`} className="font-bold text-[#0d6f6b]">Open conversation</Link>}</p>}</form>
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><p className="flex items-center gap-2 font-bold"><ShieldAlert className="h-5 w-5" /> Stay safe</p><p className="mt-1">View the property and confirm who owns or manages it before paying.</p></div>
          <button onClick={() => setReportOpen(!reportOpen)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-700"><Flag className="h-4 w-4" /> Report this listing</button>
          {reportOpen && <form onSubmit={report} className="mt-4 grid gap-3 border-t pt-4"><select value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 rounded-lg border px-2 text-sm"><option value="suspected_scam">Suspected scam</option><option value="duplicate">Duplicate listing</option><option value="incorrect_information">Incorrect information</option><option value="already_rented">Already rented</option></select><textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} placeholder="Add useful details" className="min-h-24 rounded-lg border p-3 text-sm" /><button className="h-10 rounded-lg bg-red-700 text-sm font-bold text-white">Submit report</button>{reportMessage && <p className="text-sm text-slate-700">{reportMessage}</p>}</form>}
        </aside>
      </div>
    </div>
  )
}
