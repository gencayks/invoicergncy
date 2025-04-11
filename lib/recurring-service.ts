import { supabase } from "./supabase"
import type { RecurringSchedule } from "@/components/recurring-invoice-setup"

export const createRecurringSchedule = async (invoiceId: string, schedule: RecurringSchedule) => {
  try {
    const { data, error } = await supabase
      .from("recurring_schedules")
      .insert({
        invoice_id: invoiceId,
        frequency: schedule.frequency,
        start_date: schedule.startDate.toISOString(),
        end_date: schedule.endDate ? schedule.endDate.toISOString() : null,
        day_of_month: schedule.dayOfMonth || null,
        day_of_week: schedule.dayOfWeek || null,
        send_invoice: schedule.sendInvoice,
        auto_charge: schedule.autoCharge,
      })
      .select()
      .single()

    if (error) throw error

    return { schedule: data, error: null }
  } catch (error) {
    console.error("Create recurring schedule error:", error)
    return { schedule: null, error }
  }
}

export const getInvoiceRecurringSchedule = async (invoiceId: string) => {
  try {
    const { data, error } = await supabase.from("recurring_schedules").select("*").eq("invoice_id", invoiceId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No data found
        return { schedule: null, error: null }
      }
      throw error
    }

    // Convert date strings to Date objects
    const schedule: RecurringSchedule = {
      frequency: data.frequency,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : null,
      dayOfMonth: data.day_of_month || undefined,
      dayOfWeek: data.day_of_week || undefined,
      sendInvoice: data.send_invoice,
      autoCharge: data.auto_charge,
    }

    return { schedule, error: null }
  } catch (error) {
    console.error("Get invoice recurring schedule error:", error)
    return { schedule: null, error }
  }
}

export const updateRecurringSchedule = async (scheduleId: string, updates: Partial<RecurringSchedule>) => {
  try {
    const updateData: any = {}

    if (updates.frequency) updateData.frequency = updates.frequency
    if (updates.startDate) updateData.start_date = updates.startDate.toISOString()
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate ? updates.endDate.toISOString() : null
    if (updates.dayOfMonth !== undefined) updateData.day_of_month = updates.dayOfMonth
    if (updates.dayOfWeek !== undefined) updateData.day_of_week = updates.dayOfWeek
    if (updates.sendInvoice !== undefined) updateData.send_invoice = updates.sendInvoice
    if (updates.autoCharge !== undefined) updateData.auto_charge = updates.autoCharge

    const { data, error } = await supabase
      .from("recurring_schedules")
      .update(updateData)
      .eq("id", scheduleId)
      .select()
      .single()

    if (error) throw error

    return { schedule: data, error: null }
  } catch (error) {
    console.error("Update recurring schedule error:", error)
    return { schedule: null, error }
  }
}

export const deleteRecurringSchedule = async (scheduleId: string) => {
  try {
    const { error } = await supabase.from("recurring_schedules").delete().eq("id", scheduleId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Delete recurring schedule error:", error)
    return { error }
  }
}
