"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import type { Property } from "@/lib/types"

const input = "h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-[#f15a24]"

export default function EditListingForm({ id }: { id: string }) {
  const { user, profile, loading: authLoading } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function load() {
      if (!user) return setLoading(false)
      const { data } = await supabase.from("properties").select("*").eq("id", id).single()
      setProperty(data as Property | null); setLoading(false)
    }
    if (!authLoading) void load()
  }, [user, authLoading, id])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user || !property) return
    setSaving(true); setMessage("")
    const form = new FormData(event.currentTarget)
    const images = [...property.images]
    for (const file of files) {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setSaving(false); setMessage("Every new photo must be an image smaller than 5 MB."); return }
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const path = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`
      const { error } = await supabase.storage.from("listing-images").upload(path, file)
      if (error) { setSaving(false); setMessage(error.message); return }
      images.push(supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl)
    }
    const { error } = await supabase.from("properties").update({
      title: form.get("title"), description: form.get("description"), property_type: form.get("property_type"),
      address: form.get("address"), city: form.get("city"), bedrooms: Number(form.get("bedrooms")), bathrooms: Number(form.get("bathrooms")),
      rent_amount: Number(form.get("rent_amount")), contact_phone: form.get("contact_phone"), whatsapp_phone: form.get("whatsapp_phone") || null,
      amenities: String(form.get("amenities") || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20), images,
      status: profile?.role === "admin" ? property.status : "pending_review", rejection_reason: profile?.role === "admin" ? property.rejection_reason : null,
    }).eq("id", id)
    setSaving(false)
    if (error) setMessage(error.message)
    else { const nextStatus = profile?.role === "admin" ? property.status : "pending_review"; setProperty({ ...property, images, status: nextStatus }); setFiles([]); setMessage(profile?.role === "admin" ? "Changes saved successfully." : "Changes saved successfully. The listing is waiting for administrator review.") }
  }

  if (authLoading || loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!user || !property) return <div className="mx-auto min-h-[60vh] max-w-xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Listing not available</h1><Link href="/dashboard" className="mt-5 inline-block font-bold text-[#0d6f6b]">Return to dashboard</Link></div>

  return <div className="mx-auto max-w-4xl px-4 py-10"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#0d6f6b]"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-10"><p className="font-semibold text-[#0d7c79]">Manage listing</p><h1 className="mt-1 text-3xl font-black">Edit property</h1><p className="mt-2 text-sm text-slate-600">Saving changes sends the listing back for review so public information stays trustworthy.</p>
    <form onSubmit={save} className="mt-8 grid gap-6">
      <label className="grid gap-2 text-sm font-bold">Title<input required name="title" defaultValue={property.title} minLength={10} maxLength={120} className={input} /></label>
      <label className="grid gap-2 text-sm font-bold">Description<textarea required name="description" defaultValue={property.description} minLength={30} maxLength={3000} className="min-h-36 rounded-lg border p-3 font-normal" /></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Property type<select name="property_type" defaultValue={property.property_type} className={input}><option>Flat</option><option>Apartment</option><option>House</option><option>Studio</option><option>Villa</option><option>Room</option></select></label><label className="grid gap-2 text-sm font-bold">City or area<input required name="city" defaultValue={property.city} className={input} /></label></div>
      <label className="grid gap-2 text-sm font-bold">Address<input required name="address" defaultValue={property.address} className={input} /></label>
      <div className="grid gap-5 sm:grid-cols-3"><label className="grid gap-2 text-sm font-bold">Bedrooms<input required name="bedrooms" type="number" min="0" max="20" defaultValue={property.bedrooms} className={input} /></label><label className="grid gap-2 text-sm font-bold">Bathrooms<input required name="bathrooms" type="number" min="1" max="20" defaultValue={property.bathrooms} className={input} /></label><label className="grid gap-2 text-sm font-bold">Monthly rent<input required name="rent_amount" type="number" min="1" defaultValue={property.rent_amount} className={input} /></label></div>
      <label className="grid gap-2 text-sm font-bold">Features<input name="amenities" defaultValue={property.amenities.join(", ")} className={input} /></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Contact phone<input required name="contact_phone" defaultValue={property.contact_phone} className={input} /></label><label className="grid gap-2 text-sm font-bold">WhatsApp<input name="whatsapp_phone" defaultValue={property.whatsapp_phone ?? ""} className={input} /></label></div>
      <div><p className="text-sm font-bold">Current photos ({property.images.length})</p><div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">{property.images.map((image) => <div key={image} className="relative h-24 overflow-hidden rounded-xl"><Image src={image} alt="Property" fill className="object-cover" /></div>)}</div></div>
      <label className="grid gap-2 text-sm font-bold"><span className="flex items-center gap-2"><ImagePlus className="h-5 w-5" /> Add more photos</span><input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, Math.max(0, 8 - property.images.length)))} className="rounded-xl border border-dashed p-5 font-normal" /><span className="text-xs font-normal text-slate-500">Maximum 8 photos total.</span></label>
      {message && <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {message}</p>}
      <button disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f15a24] font-black text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save and submit for review</button>
    </form>
  </div></div>
}
