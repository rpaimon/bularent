import PropertiesPage from "./PropertiesPage"
import { Suspense } from "react"

export default function Properties() {
  return <Suspense fallback={<div className="min-h-[70vh]" />}><PropertiesPage /></Suspense>
}
