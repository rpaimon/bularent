import { Suspense } from "react"
import MessagesCenter from "./MessagesCenter"

export default function MessagesPage() { return <Suspense fallback={<div className="min-h-[70vh]" />}><MessagesCenter /></Suspense> }
