import { CheckCircle2, Search, ShieldCheck } from "lucide-react"

const steps = [
  { icon: Search, title: "Browse freely", text: "Search approved rentals without creating an account." },
  { icon: ShieldCheck, title: "Review the details", text: "Check the rent, location, features and owner contact information." },
  { icon: CheckCircle2, title: "Inspect before paying", text: "Arrange a viewing and confirm who owns or manages the property." },
]

export default function AboutPage() {
  return <div className="mx-auto min-h-[65vh] max-w-5xl px-4 py-16"><p className="font-semibold text-[#0d7c79]">How BulaRent works</p><h1 className="mt-2 max-w-3xl text-4xl font-black md:text-5xl">A clearer, more accountable rental process for Fiji.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">BulaRent helps renters discover long-term homes while giving landlords and agents a structured way to publish accurate listings.</p><div className="mt-12 grid gap-6 md:grid-cols-3">{steps.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border bg-white p-6"><Icon className="h-8 w-8 text-[#0d7c79]" /><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-2 leading-7 text-slate-600">{text}</p></div>)}</div><div className="mt-12 rounded-2xl bg-amber-50 p-6 text-amber-950"><h2 className="font-bold">Important safety reminder</h2><p className="mt-2 leading-7">Approval means a listing passed BulaRent moderation; it is not a guarantee. Always view the property, check identification and avoid paying through unusual or untraceable methods.</p></div></div>
}
