import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check your .env file or environment settings.")
}

// Create Supabase client with retry options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => {
      return fetch(...args)
    },
  },
  // Add custom headers for debugging
  headers: {
    "x-application-name": "gncy-invoice-generator",
  },
})

// Helper function to get authenticated user
export const getCurrentUser = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error.message)
      return null
    }

    return session?.user || null
  } catch (error) {
    console.error("Unexpected error getting user:", error)
    return null
  }
}

// Helper function to get user profile with role information
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error getting user profile:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error getting profile:", error)
    return null
  }
}

// Export a function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    // Simple query to check if the database is accessible
    const { data, error } = await supabase.from("_health_check").select("*").limit(1)

    if (error) {
      // If the table doesn't exist, that's fine - we just want to check connection
      if (error.code === "PGRST116") {
        return { connected: true, error: null }
      }
      throw error
    }

    return { connected: true, error: null }
  } catch (error) {
    console.error("Database connection check failed:", error)
    return { connected: false, error }
  }
}
