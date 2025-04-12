import { supabase } from "./supabase"

export type SignUpData = {
  email: string
  password: string
  fullName: string
}

export type SignInData = {
  email: string
  password: string
}

export const signUp = async ({ email, password, fullName }: SignUpData) => {
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) throw authError

    if (authData.user) {
      // Create profile record
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: "owner", // Default role for new sign-ups
      })

      if (profileError) throw profileError

      return { user: authData.user, error: null }
    }

    return { user: null, error: new Error("User creation failed") }
  } catch (error) {
    console.error("Sign up error:", error)
    return { user: null, error }
  }
}

export const signIn = async ({ email, password }: SignInData) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { session: data.session, user: data.user, error: null }
  } catch (error) {
    console.error("Sign in error:", error)
    return { session: null, user: null, error }
  }
}

export const signOut = async () => {
  try {
    // Clear any local storage items related to auth
    if (typeof window !== "undefined") {
      localStorage.removeItem("gncy-invoice-auth-token")
      localStorage.removeItem("supabase.auth.token")
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Sign out error:", error)
    return { error }
  }
}

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error }
  }
}

export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Update password error:", error)
    return { error }
  }
}

export const updateProfile = async (userId: string, updates: { fullName?: string; avatarUrl?: string }) => {
  try {
    const updateData: any = {}

    if (updates.fullName) updateData.full_name = updates.fullName
    if (updates.avatarUrl) updateData.avatar_url = updates.avatarUrl

    const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error }
  }
}

// Add a function to check if the current session is valid
export const validateSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Session validation error:", error)
      return false
    }

    return !!data.session
  } catch (error) {
    console.error("Session validation exception:", error)
    return false
  }
}

// Add a function to refresh the session
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error("Session refresh error:", error)
      return { success: false, error }
    }

    return { success: true, session: data.session, user: data.user }
  } catch (error) {
    console.error("Session refresh exception:", error)
    return { success: false, error }
  }
}
