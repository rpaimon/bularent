"use client"

import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, Bath, Bed, ChevronLeft, ChevronRight, Images, MapPin } from "lucide-react"
import { useState } from "react"
import type { Property } from "@/lib/types"

export function ListingCard({ property }: { property: Property }) {
  const images = property.images.length ? property.images : ["/placeholder.svg"]
  const [index, setIndex] = useState(0)

  function move(event: React.MouseEvent, direction: number) {
    event.preventDefault()
    event.stopPropagation()
    setIndex((current) => (current + direction + images.length) % images.length)
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#07384d]/10 bg-white shadow-[0_10px_30px_rgba(7,56,77,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(7,56,77,0.15)]">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="group relative h-56 bg-slate-100">
          <Image src={images[index]} alt={`${property.title} — photo ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          {images.length > 1 && <><button onClick={(event) => move(event, -1)} aria-label="Previous photo" className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#07384d] opacity-100 shadow sm:opacity-0 sm:group-hover:opacity-100"><ChevronLeft className="h-5 w-5" /></button><button onClick={(event) => move(event, 1)} aria-label="Next photo" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#07384d] opacity-100 shadow sm:opacity-0 sm:group-hover:opacity-100"><ChevronRight className="h-5 w-5" /></button><span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold text-white"><Images className="h-3.5 w-3.5" /> {index + 1}/{images.length}</span></>}
          {property.featured && <span className="absolute left-3 top-3 rounded-full bg-[#f15a24] px-3 py-1 text-xs font-black text-white">Featured</span>}
          {property.verified && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0d7c79]"><BadgeCheck className="h-4 w-4" /> Verified</span>}
        </div>
        <div className="p-5">
          <p className="text-2xl font-black text-[#07384d]">FJD ${property.rent_amount.toLocaleString()}<span className="text-sm font-normal text-slate-500"> / month</span></p>
          <h2 className="mt-2 line-clamp-2 text-lg font-black text-[#07384d]">{property.title}</h2>
          <p className="mt-2 flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" /> {property.city}</p>
          <div className="mt-4 flex items-center gap-5 border-t pt-4 text-sm text-slate-600"><span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms} bed</span><span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} bath</span><span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-xs">{property.property_type}</span></div>
        </div>
      </Link>
    </article>
  )
}
