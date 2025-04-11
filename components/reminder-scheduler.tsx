"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, X } from "lucide-react"

export interface Reminder {
  id: string
  date: Date
  emailTemplate: string
  enabled: boolean
}

interface ReminderSchedulerProps {
  customerEmail: string
  invoiceNumber: string
  dueDate: string
  onScheduleReminders: (reminders: Reminder[]) => void
}

export default function ReminderScheduler({
  customerEmail,
  invoiceNumber,
  dueDate,
  onScheduleReminders,
}: ReminderSchedulerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      date: new Date(dueDate),
      emailTemplate: "friendly",
      enabled: true,
    },
  ])

  const emailTemplates = [
    { id: "friendly", name: "Friendly Reminder" },
    { id: "follow-up", name: "Follow-up" },
    { id: "final-notice", name: "Final Notice" },
  ]

  const addReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      date: new Date(dueDate),
      emailTemplate: "friendly",
      enabled: true,
    }
    setReminders([...reminders, newReminder])
  }

  const removeReminder = (id: string) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id))
  }

  const updateReminder = (id: string, field: keyof Reminder, value: any) => {
    setReminders(reminders.map((reminder) => (reminder.id === id ? { ...reminder, [field]: value } : reminder)))
  }

  const handleSaveReminders = () => {
    onScheduleReminders(reminders)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-xl">Payment Reminders</h2>
        <Button variant="outline" size="sm" onClick={addReminder}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {customerEmail ? (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-start space-x-4 p-4 border rounded-md">
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={(checked) => updateReminder(reminder.id, "enabled", checked)}
                  />
                  <Label>Enable reminder</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Send Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {reminder.date ? format(reminder.date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={reminder.date}
                          onSelect={(date) => date && updateReminder(reminder.id, "date", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Template</Label>
                    <Select
                      value={reminder.emailTemplate}
                      onValueChange={(value) => updateReminder(reminder.id, "emailTemplate", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm text-gray-500">Will send to: {customerEmail}</div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => removeReminder(reminder.id)} className="text-gray-500">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={handleSaveReminders}>Schedule Reminders</Button>
        </div>
      ) : (
        <div className="text-amber-600 p-4 bg-amber-50 rounded-md">
          Please add a customer email address to enable payment reminders.
        </div>
      )}
    </div>
  )
}
