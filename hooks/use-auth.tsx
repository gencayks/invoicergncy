"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, handleAuthError } from "@/lib/supabase"
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

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      // Clear any existing session data
      setUser(null)
      setSession(null)
      setProfile(null)

      // Get a fresh session
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        handleAuthError(error)
        return false
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        try {
          const profile = await getUserProfile(data.session.user.id)
          setProfile(profile)
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError)
        }
      }

      return true
    } catch (err) {
      console.error("Session refresh error:", err)
      return false
    }
  }

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          // Handle auth errors specifically
          handleAuthError(error)
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
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event)

      // Handle specific auth events
      if (event === "SIGNED_OUT") {
        setUser(null)
        setSession(null)
        setProfile(null)
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          try {
            const profile = await getUserProfile(newSession.user.id)
            setProfile(profile)
          } catch (profileError) {
            console.error("Error fetching user profile on auth change:", profileError)
          }
        }
      } else if (event === "USER_UPDATED") {
        setSession(newSession)
        setUser(newSession?.user ?? null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error("Sign in error:", error)
      }

      return { error }
    } catch (error) {
      console.error("Sign in exception:", error)
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
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
      console.error("Sign up error:", error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (!error) {
        // Clear local state
        setUser(null)
        setSession(null)
        setProfile(null)
      }

      return { error }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error: error as Error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: error as Error }
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
    refreshSession,
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
