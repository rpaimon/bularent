"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Search, SlidersHorizontal } from "lucide-react"
import { ListingCard } from "@/components/ListingCard"
import { demoProperties } from "@/lib/demo-data"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Property } from "@/lib/types"

export default function PropertiesPage() {
  const params = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(params.get("search") ?? "")
  const [city, setCity] = useState("")
  const [type, setType] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [maxRent, setMaxRent] = useState("")

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setProperties(demoProperties)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
      if (!error && data) setProperties(data as Property[])
      setLoading(false)
    }
    void load()
  }, [])

  const filtered = useMemo(() => properties.filter((property) => {
    const term = search.toLowerCase().trim()
    return (!term || `${property.title} ${property.city} ${property.description}`.toLowerCase().includes(term))
      && (!city || property.city === city)
      && (!type || property.property_type === type)
      && (!bedrooms || property.bedrooms >= Number(bedrooms))
      && (!maxRent || property.rent_amount <= Number(maxRent))
  }), [properties, search, city, type, bedrooms, maxRent])

  const cities = Array.from(new Set(properties.map((property) => property.city))).sort()
  const types = Array.from(new Set(properties.map((property) => property.property_type))).sort()

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10">
      <div className="max-w-2xl"><p className="font-semibold text-[#0d7c79]">Available rentals</p><h1 className="mt-1 text-4xl font-black">Find your next home</h1><p className="mt-3 text-slate-600">Only approved listings appear here. Always inspect a property before making payment.</p></div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <label className="relative md:col-span-2"><Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><span className="sr-only">Search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search location or keyword" className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 outline-none focus:border-[#f15a24]" /></label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-lg border border-slate-300 px-3"><option value="">All locations</option>{cities.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 rounded-lg border border-slate-300 px-3"><option value="">All property types</option>{types.map((item) => <option key={item}>{item}</option>)}</select>
          <button onClick={() => { setSearch(""); setCity(""); setType(""); setBedrooms(""); setMaxRent("") }} className="h-11 rounded-lg border border-slate-300 font-semibold hover:bg-slate-50">Clear filters</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3"><SlidersHorizontal className="h-4 w-4 text-slate-500" /><select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm"><option value="">Any bedrooms</option><option value="1">1+ bedrooms</option><option value="2">2+ bedrooms</option><option value="3">3+ bedrooms</option></select><select value={maxRent} onChange={(e) => setMaxRent(e.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm"><option value="">Any price</option><option value="500">Up to FJD $500</option><option value="1000">Up to FJD $1,000</option><option value="1500">Up to FJD $1,500</option><option value="2500">Up to FJD $2,500</option></select></div>
      </div>

      <div className="mt-8 flex items-center justify-between"><h2 className="text-xl font-bold">{filtered.length} {filtered.length === 1 ? "rental" : "rentals"}</h2>{!isSupabaseConfigured && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Preview data</span>}</div>
      {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-[#0d7c79]" /></div> : filtered.length ? <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((property) => <ListingCard key={property.id} property={property} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed p-12 text-center text-slate-600">No rentals match these filters.</div>}
    </div>
  )
}
