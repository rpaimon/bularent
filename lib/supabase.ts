import { createClient } from "@supabase/supabase-js"

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey)

// A harmless local placeholder lets the marketing pages build before deployment
// credentials are supplied. Data screens check isSupabaseConfigured before querying.
export const supabase = createClient(
  configuredUrl ?? "https://placeholder.supabase.co",
  configuredKey ?? "placeholder-anon-key",
  { auth: { persistSession: true, autoRefreshToken: true } },
)
