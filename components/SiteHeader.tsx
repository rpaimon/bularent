"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const dashboard = profile?.role === "admin" ? "/admin" : "/dashboard"

  return (
    <header className="sticky top-0 z-50 border-b border-[#07384d]/10 bg-[#fffaf2]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="BulaRent home">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0d7c79] text-lg font-black text-white shadow-sm">B</span>
          <span className="text-2xl font-black text-[#07384d]">Bula<span className="text-[#f15a24]">Rent</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/properties" className="text-sm font-bold text-[#07384d] hover:text-[#f15a24]">Browse rentals</Link>
          <Link href="/submit" className="text-sm font-bold text-[#07384d] hover:text-[#f15a24]">List a property</Link>
          <Link href="/about" className="text-sm font-bold text-[#07384d] hover:text-[#f15a24]">How it works</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href={dashboard} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Dashboard</Link>
              <button onClick={() => void signOut()} className="rounded-xl bg-[#07384d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#052c3c]">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Sign in</Link>
              <Link href="/signup" className="rounded-xl bg-[#f15a24] px-5 py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#d94713]">Get started</Link>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          <nav className="grid gap-2" onClick={() => setOpen(false)}>
            <Link href="/properties" className="rounded-lg px-3 py-3 font-medium hover:bg-slate-50">Browse rentals</Link>
            <Link href="/submit" className="rounded-lg px-3 py-3 font-medium hover:bg-slate-50">List a property</Link>
            <Link href="/about" className="rounded-lg px-3 py-3 font-medium hover:bg-slate-50">How it works</Link>
            <Link href={user ? dashboard : "/login"} className="mt-2 rounded-lg bg-[#f15a24] px-3 py-3 text-center font-semibold text-white">
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
