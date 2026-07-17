"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { ArrowRight, BadgeCheck, Search, ShieldCheck } from "lucide-react"
import { ListingCard } from "@/components/ListingCard"
import { demoProperties } from "@/lib/demo-data"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Property } from "@/lib/types"

export default function Homepage() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [featured, setFeatured] = useState<Property[]>(isSupabaseConfigured ? [] : demoProperties)
  const [loadingListings, setLoadingListings] = useState(isSupabaseConfigured)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    if (!isSupabaseConfigured) return
    async function loadFeatured() {
      const [{ data, error }, { data: platform }] = await Promise.all([
        supabase.from("properties").select("*").eq("status", "approved").order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(4),
        supabase.from("platform_settings").select("announcement").eq("id", true).maybeSingle(),
      ])
      if (!error) setFeatured((data as Property[]) ?? [])
      if (platform?.announcement) setAnnouncement(platform.announcement)
      setLoadingListings(false)
    }
    void loadFeatured()
  }, [])

  function search(event: FormEvent) {
    event.preventDefault()
    router.push(location.trim() ? `/properties?search=${encodeURIComponent(location.trim())}` : "/properties")
  }

  return (
    <>
      {announcement && <div className="bg-[#f15a24] px-4 py-3 text-center text-sm font-bold text-white">{announcement}</div>}
      <section className="relative isolate min-h-[680px] overflow-hidden bg-[#0a6567]">
        <div className="absolute inset-0 bg-[url('/fiji-beach-palms.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#075d62]/60 via-[#0b7772]/25 to-[#07384d]/45" />
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-xl font-semibold tracking-wide text-white/95 md:text-2xl">Find homes, the Bula way.</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight text-white drop-shadow-sm md:text-7xl">A better way to rent in Fiji.</h1>

          <div className="mt-10 w-full max-w-4xl rounded-[2rem] bg-[#fffaf2] p-6 shadow-[0_24px_80px_rgba(4,44,58,0.28)] sm:p-10 md:p-14">
            <h2 className="text-3xl font-black leading-tight text-[#07384d] sm:text-4xl md:text-5xl">Bula! Find your perfect home</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">Search genuine long-term rentals across Fiji’s towns and communities.</p>
            <form onSubmit={search} className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
              <label className="relative flex-1"><span className="sr-only">Where do you want to live?</span><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where do you want to live?" className="h-14 w-full rounded-xl border-0 bg-transparent pl-12 pr-4 text-base text-[#07384d] outline-none sm:text-lg" /></label>
              <button className="h-14 rounded-xl bg-[#f15a24] px-9 text-lg font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#d94713]">Search</button>
            </form>
          </div>
        </div>
      </section>

      <section className="tropical-pattern bg-[#fffaf2]">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="text-center"><p className="font-bold uppercase tracking-[0.22em] text-[#0d7c79]">Homes ready to explore</p><h2 className="mt-3 text-4xl font-black text-[#07384d] md:text-5xl">Featured listings</h2><p className="mx-auto mt-4 max-w-2xl text-slate-600">Clear prices, useful details and Fiji locations—all in one friendly place.</p></div>
          {loadingListings ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-[420px] animate-pulse rounded-2xl bg-white/80" />)}</div> : featured.length ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{featured.map((property) => <ListingCard key={property.id} property={property} />)}</div> : <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed bg-white/80 p-10 text-center"><p className="font-bold text-[#07384d]">No approved listings yet</p><p className="mt-2 text-sm text-slate-600">Approved properties will automatically appear here.</p></div>}
          <div className="mt-10 text-center"><Link href="/properties" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#07384d] bg-white px-6 py-3 font-black text-[#07384d] transition hover:bg-[#07384d] hover:text-white">Browse all rentals <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="bg-[#0d7c79] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-6"><ShieldCheck className="h-8 w-8 text-[#ffd1b8]" /><h3 className="mt-4 text-xl font-black">Reviewed before publishing</h3><p className="mt-2 leading-7 text-white/80">Listings enter a moderation queue before renters can discover them.</p></div>
          <div className="rounded-2xl bg-white/10 p-6"><BadgeCheck className="h-8 w-8 text-[#ffd1b8]" /><h3 className="mt-4 text-xl font-black">Clear trust signals</h3><p className="mt-2 leading-7 text-white/80">Verification is controlled by BulaRent—not self-declared by an advertiser.</p></div>
          <div className="rounded-2xl bg-white/10 p-6"><Search className="h-8 w-8 text-[#ffd1b8]" /><h3 className="mt-4 text-xl font-black">Built around Fiji</h3><p className="mt-2 leading-7 text-white/80">Search familiar towns, compare monthly rent and contact owners directly.</p></div>
        </div>
      </section>

      <section className="bg-[#fffaf2] px-4 py-20 text-center"><div className="mx-auto max-w-3xl"><p className="font-bold uppercase tracking-[0.22em] text-[#0d7c79]">Have a place to rent?</p><h2 className="mt-3 text-4xl font-black text-[#07384d]">Help someone find their next home.</h2><p className="mt-4 text-lg text-slate-600">Create a clear listing, upload real photos and follow its review from your dashboard.</p><Link href="/submit" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#f15a24] px-9 py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#d94713]">List your property <ArrowRight className="h-5 w-5" /></Link></div></section>
    </>
  )
}
