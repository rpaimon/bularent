"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { UserRole } from "@/lib/types"

export default function AuthPage() {
  const pathname = usePathname()
  const router = useRouter()
  const signup = pathname === "/signup"
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<UserRole>("tenant")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!isSupabaseConfigured) { setMessage("Connect Supabase before using accounts."); return }
    setBusy(true); setMessage("")
    const result = signup ? await signUp(email, password, fullName, role) : await signIn(email, password)
    setBusy(false)
    if (result.error) { setMessage(result.error.message); return }
    if (signup && !result.data.session) { setMessage("Check your email to confirm your account, then sign in."); return }
    const signedInUser = result.data.user
    if (signedInUser) {
      const { data: signedInProfile } = await supabase.from("profiles").select("role").eq("id", signedInUser.id).single()
      router.push(signedInProfile?.role === "admin" ? "/admin" : "/dashboard")
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-6xl place-items-center px-4 py-12">
      <div className="grid w-full overflow-hidden rounded-3xl border bg-white shadow-xl md:grid-cols-2">
        <div className="hidden bg-slate-950 p-12 text-white md:block"><ShieldCheck className="h-10 w-10 text-cyan-300" /><h1 className="mt-8 text-4xl font-black">A safer rental community starts with accountable listings.</h1><p className="mt-5 leading-7 text-slate-300">Owners control their listings. BulaRent reviews every property before renters can see it.</p></div>
        <div className="p-7 sm:p-12">
          <p className="font-semibold text-[#0d7c79]">{signup ? "Create your account" : "Welcome back"}</p>
          <h2 className="mt-1 text-3xl font-black">{signup ? "Join BulaRent" : "Sign in to BulaRent"}</h2>
          <form onSubmit={submit} className="mt-8 grid gap-5">
            {signup && <label className="grid gap-2 text-sm font-semibold">Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-lg border px-3 font-normal" /></label>}
            <label className="grid gap-2 text-sm font-semibold">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg border px-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-lg border px-3 font-normal" /></label>
            {signup && <label className="grid gap-2 text-sm font-semibold">I am joining as<select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="h-11 rounded-lg border px-3 font-normal"><option value="tenant">Renter</option><option value="landlord">Landlord</option><option value="agent">Property agent</option></select></label>}
            {message && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
            <button disabled={busy} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f15a24] font-bold text-white hover:bg-[#d94713] disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{signup ? "Create account" : "Sign in"}</button>
          </form>
          <p className="mt-6 text-sm text-slate-600">{signup ? "Already registered?" : "New to BulaRent?"} <Link href={signup ? "/login" : "/signup"} className="font-semibold text-[#0d6f6b]">{signup ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </div>
    </div>
  )
}
