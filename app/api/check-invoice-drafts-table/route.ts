import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Query to check if the table exists
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "invoice_drafts")
      .single()

    if (error) {
      console.error("Error checking table existence:", error)
      return NextResponse.json({ exists: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (error) {
    console.error("Unexpected error checking table existence:", error)
    return NextResponse.json(
      { exists: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
