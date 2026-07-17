import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BulaRent - Find Your Perfect Home in Fiji",
  description: "Browse trusted long-term rental homes and apartments across Fiji.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#fffaf2] text-[#07384d]`}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
