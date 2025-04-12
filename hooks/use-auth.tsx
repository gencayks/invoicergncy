"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"
import { getUserProfile } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: any | null
  isLoading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [initAttempted, setInitAttempted] = useState(false)

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        console.log("Initializing auth...")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth error:", error)
          throw error
        }

        setSession(data.session)
        setUser(data.session?.user ?? null)

        if (data.session?.user) {
          try {
            const profile = await getUserProfile(data.session.user.id)
            setProfile(profile)
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError)
            // Don't block auth flow if profile fetch fails
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err)
        setError(err as Error)
      } finally {
        // Always set loading to false, even if there's an error
        setIsLoading(false)
        setInitAttempted(true)
        console.log("Auth initialization complete")
      }
    }

    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth initialization timed out")
        setIsLoading(false)
        setInitAttempted(true)
      }
    }, 5000) // 5 second timeout

    initAuth()

    return () => clearTimeout(safetyTimeout)
  }, [])

  useEffect(() => {
    // Listen for auth changes
    if (!initAttempted) return

    console.log("Setting up auth state change listener")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event)

      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        try {
          const profile = await getUserProfile(newSession.user.id)
          setProfile(profile)
        } catch (profileError) {
          console.error("Error fetching user profile on auth change:", profileError)
        }
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => {
      console.log("Cleaning up auth state change listener")
      subscription.unsubscribe()
    }
  }, [initAttempted])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create profile record
      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email,
          full_name: fullName,
          role: "owner",
        })

        if (profileError) throw profileError
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()

      if (!error) {
        // Clear local state
        setUser(null)
        setSession(null)
        setProfile(null)
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    session,
    profile,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
