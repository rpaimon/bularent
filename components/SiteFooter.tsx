import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-0 bg-[#07384d] text-white/75">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="text-xl font-bold text-white">BulaRent</p>
          <p className="mt-3 max-w-sm text-sm leading-6">A safer, simpler way to find long-term rental homes across Fiji.</p>
        </div>
        <div>
          <p className="font-semibold text-white">Explore</p>
          <div className="mt-3 grid gap-2 text-sm"><Link href="/properties">Browse rentals</Link><Link href="/submit">List a property</Link><Link href="/about">How it works</Link></div>
        </div>
        <div>
          <p className="font-semibold text-white">Safety</p>
          <p className="mt-3 text-sm leading-6">Never send money before viewing a property and confirming the owner or agent.</p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs">© 2026 BulaRent. Built for Fiji.</div>
    </footer>
  )
}
