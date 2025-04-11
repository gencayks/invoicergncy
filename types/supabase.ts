export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: "owner" | "admin" | "member" | "viewer" | "client"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: "owner" | "admin" | "member" | "viewer" | "client"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: "owner" | "admin" | "member" | "viewer" | "client"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string | null
          email: string | null
          phone: string | null
          tax_id: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address?: string | null
          email?: string | null
          phone?: string | null
          tax_id?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string | null
          email?: string | null
          phone?: string | null
          tax_id?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          business_id: string
          name: string
          address: string | null
          email: string | null
          phone: string | null
          payment_terms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          address?: string | null
          email?: string | null
          phone?: string | null
          payment_terms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          address?: string | null
          email?: string | null
          phone?: string | null
          payment_terms?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          business_id: string
          client_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
          currency: string
          tax_rate: number
          notes: string | null
          template_id: string | null
          signature: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          client_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled"
          currency: string
          tax_rate: number
          notes?: string | null
          template_id?: string | null
          signature?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          client_id?: string
          invoice_number?: string
          issue_date?: string
          due_date?: string
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled"
          currency?: string
          tax_rate?: number
          notes?: string | null
          template_id?: string | null
          signature?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string
          is_system: boolean
          colors: Json
          fonts: Json
          layout: Json
          defaults: Json
          preview_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description: string
          is_system?: boolean
          colors: Json
          fonts: Json
          layout: Json
          defaults: Json
          preview_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string
          is_system?: boolean
          colors?: Json
          fonts?: Json
          layout?: Json
          defaults?: Json
          preview_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          invoice_id: string
          date: string
          email_template: string
          enabled: boolean
          sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          date: string
          email_template: string
          enabled?: boolean
          sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          date?: string
          email_template?: string
          enabled?: boolean
          sent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurring_schedules: {
        Row: {
          id: string
          invoice_id: string
          frequency: "weekly" | "monthly" | "quarterly" | "annually"
          start_date: string
          end_date: string | null
          day_of_month: number | null
          day_of_week: number | null
          send_invoice: boolean
          auto_charge: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          frequency: "weekly" | "monthly" | "quarterly" | "annually"
          start_date: string
          end_date?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          send_invoice?: boolean
          auto_charge?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          frequency?: "weekly" | "monthly" | "quarterly" | "annually"
          start_date?: string
          end_date?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          send_invoice?: boolean
          auto_charge?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
