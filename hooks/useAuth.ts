"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string | null
  role: "admin" | "landlord" | "tenant"
  is_premium: boolean
  verified: boolean
  banned: boolean
  avatar_url: string | null
  bio: string | null
  location: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, name: string, role: "landlord" | "tenant" = "tenant") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (data.user && !error) {
      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        role,
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
      }
    }

    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("No user logged in") }

    const { data, error } = await supabase.from("users").update(updates).eq("id", user.id).select().single()

    if (data && !error) {
      setProfile(data)
    }

    return { data, error }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
