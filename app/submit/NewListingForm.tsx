"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { ImagePlus, Loader2, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"

const input = "h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-[#f15a24] focus:ring-2 focus:ring-[#ffe0d1]"

export default function NewListingForm() {
  const { user, profile, loading } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("")
    if (!user) { setMessage("Please sign in as a landlord or agent first."); return }
    if (!profile || !["landlord", "agent", "admin"].includes(profile.role)) { setMessage("Your account must be a landlord or agent to create listings."); return }
    if (files.length < 1) { setMessage("Add at least one clear property photo."); return }
    const invalid = files.find((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
    if (invalid) { setMessage("Every photo must be an image smaller than 5 MB."); return }
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const propertyId = crypto.randomUUID()
    const images: string[] = []
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const path = `${user.id}/${propertyId}/${crypto.randomUUID()}.${extension}`
      const { error } = await supabase.storage.from("listing-images").upload(path, file, { cacheControl: "3600", upsert: false })
      if (error) { setBusy(false); setMessage(`Photo upload failed: ${error.message}`); return }
      images.push(supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl)
    }
    const amenities = String(form.get("amenities") || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20)
    const { error } = await supabase.from("properties").insert({
      id: propertyId,
      owner_id: user.id,
      title: form.get("title"),
      description: form.get("description"),
      property_type: form.get("property_type"),
      address: form.get("address"),
      city: form.get("city"),
      bedrooms: Number(form.get("bedrooms")),
      bathrooms: Number(form.get("bathrooms")),
      rent_amount: Number(form.get("rent_amount")),
      available_from: form.get("available_from") || null,
      furnished: form.get("furnished") === "on",
      contact_phone: form.get("contact_phone"),
      whatsapp_phone: form.get("whatsapp_phone") || null,
      amenities,
      images,
      status: "pending_review",
    })
    setBusy(false)
    if (error) { setMessage(error.message); return }
    event.currentTarget.reset(); setFiles([]); setMessage("Listing submitted successfully. It is now waiting for BulaRent review.")
  }

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!isSupabaseConfigured) return <div className="mx-auto min-h-[60vh] max-w-2xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Listing submission is prepared</h1><p className="mt-4 text-slate-600">Connect the Supabase project to activate accounts, image uploads and submissions.</p></div>
  if (!user) return <div className="mx-auto min-h-[60vh] max-w-2xl px-4 py-20 text-center"><h1 className="text-3xl font-black">Sign in to list a property</h1><p className="mt-4 text-slate-600">Landlord and agent accounts can submit properties for review.</p><Link href="/login" className="mt-6 inline-block rounded-xl bg-[#f15a24] px-6 py-3 font-bold text-white">Sign in</Link></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl bg-[#eef9f6] p-5 text-blue-950"><p className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5" /> Every listing is reviewed</p><p className="mt-1 text-sm">Your property will not appear publicly until an administrator approves it.</p></div>
      <div className="mt-7 rounded-3xl border bg-white p-6 shadow-sm sm:p-10"><p className="font-semibold text-[#0d7c79]">New rental</p><h1 className="mt-1 text-3xl font-black">List your property</h1>
        <form onSubmit={submit} className="mt-8 grid gap-6">
          <label className="grid gap-2 text-sm font-semibold">Listing title<input required name="title" minLength={10} maxLength={120} placeholder="e.g. Clean 2-bedroom flat in Narere" className={input} /></label>
          <label className="grid gap-2 text-sm font-semibold">Description<textarea required name="description" minLength={30} maxLength={3000} placeholder="Describe the home, nearby amenities and important conditions" className="min-h-36 rounded-lg border border-slate-300 p-3 font-normal" /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Property type<select name="property_type" className={input}><option>Flat</option><option>Apartment</option><option>House</option><option>Studio</option><option>Villa</option><option>Room</option></select></label><label className="grid gap-2 text-sm font-semibold">City or area<input required name="city" placeholder="Suva" className={input} /></label></div>
          <label className="grid gap-2 text-sm font-semibold">Street address<input required name="address" placeholder="Street and neighbourhood" className={input} /></label>
          <div className="grid gap-5 sm:grid-cols-3"><label className="grid gap-2 text-sm font-semibold">Bedrooms<input required name="bedrooms" type="number" min="0" max="20" className={input} /></label><label className="grid gap-2 text-sm font-semibold">Bathrooms<input required name="bathrooms" type="number" min="1" max="20" className={input} /></label><label className="grid gap-2 text-sm font-semibold">Monthly rent (FJD)<input required name="rent_amount" type="number" min="1" max="100000" className={input} /></label></div>
          <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Available from<input name="available_from" type="date" className={input} /></label><label className="flex items-center gap-3 pt-7 text-sm font-semibold"><input name="furnished" type="checkbox" className="h-5 w-5" /> Furnished</label></div>
          <label className="grid gap-2 text-sm font-semibold">Features, separated by commas<input name="amenities" placeholder="Car park, hot water, fenced yard" className={input} /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Contact phone<input required name="contact_phone" type="tel" placeholder="e.g. 986 3733" className={input} /></label><label className="grid gap-2 text-sm font-semibold">WhatsApp number<input name="whatsapp_phone" type="tel" placeholder="Include country code, e.g. 6799863733" className={input} /></label></div>
          <label className="grid gap-2 text-sm font-semibold"><span className="flex items-center gap-2"><ImagePlus className="h-5 w-5" /> Property photos</span><input required type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 8))} className="rounded-lg border border-dashed border-slate-300 p-5 font-normal" /><span className="text-xs font-normal text-slate-500">1–8 photos, maximum 5 MB each.</span></label>
          {message && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">{message}</p>}
          <button disabled={busy} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f15a24] font-bold text-white hover:bg-[#d94713] disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit for review</button>
        </form>
      </div>
    </div>
  )
}
