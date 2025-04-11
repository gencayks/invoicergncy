import { supabase } from "./supabase"
import type { Reminder } from "@/components/reminder-scheduler"

export const createReminders = async (invoiceId: string, reminders: Omit<Reminder, "id">[]) => {
  try {
    const reminderData = reminders.map((reminder) => ({
      invoice_id: invoiceId,
      date: reminder.date.toISOString(),
      email_template: reminder.emailTemplate,
      enabled: reminder.enabled,
      sent: false,
    }))

    const { data, error } = await supabase.from("reminders").insert(reminderData).select()

    if (error) throw error

    return { reminders: data, error: null }
  } catch (error) {
    console.error("Create reminders error:", error)
    return { reminders: [], error }
  }
}

export const getInvoiceReminders = async (invoiceId: string) => {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("date", { ascending: true })

    if (error) throw error

    // Convert date strings to Date objects
    const reminders = data.map((reminder) => ({
      id: reminder.id,
      date: new Date(reminder.date),
      emailTemplate: reminder.email_template,
      enabled: reminder.enabled,
      sent: reminder.sent,
    }))

    return { reminders, error: null }
  } catch (error) {
    console.error("Get invoice reminders error:", error)
    return { reminders: [], error }
  }
}

export const updateReminder = async (reminderId: string, updates: Partial<Reminder>) => {
  try {
    const updateData: any = {}

    if (updates.date) updateData.date = updates.date.toISOString()
    if (updates.emailTemplate !== undefined) updateData.email_template = updates.emailTemplate
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled

    const { data, error } = await supabase.from("reminders").update(updateData).eq("id", reminderId).select().single()

    if (error) throw error

    return { reminder: data, error: null }
  } catch (error) {
    console.error("Update reminder error:", error)
    return { reminder: null, error }
  }
}

export const deleteReminder = async (reminderId: string) => {
  try {
    const { error } = await supabase.from("reminders").delete().eq("id", reminderId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Delete reminder error:", error)
    return { error }
  }
}

export const markReminderAsSent = async (reminderId: string) => {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .update({ sent: true })
      .eq("id", reminderId)
      .select()
      .single()

    if (error) throw error

    return { reminder: data, error: null }
  } catch (error) {
    console.error("Mark reminder as sent error:", error)
    return { reminder: null, error }
  }
}
