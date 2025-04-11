"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addMonths, addWeeks } from "date-fns"
import { CalendarIcon } from "lucide-react"

export interface RecurringSchedule {
  frequency: "weekly" | "monthly" | "quarterly" | "annually"
  startDate: Date
  endDate?: Date | null
  dayOfMonth?: number
  dayOfWeek?: number
  sendInvoice: boolean
  autoCharge: boolean
}

interface RecurringInvoiceSetupProps {
  onScheduleChange: (schedule: RecurringSchedule) => void
  customerHasPaymentMethod?: boolean
}

export default function RecurringInvoiceSetup({
  onScheduleChange,
  customerHasPaymentMethod = false,
}: RecurringInvoiceSetupProps) {
  const [schedule, setSchedule] = useState<RecurringSchedule>({
    frequency: "monthly",
    startDate: new Date(),
    endDate: null,
    dayOfMonth: new Date().getDate(),
    sendInvoice: true,
    autoCharge: false,
  })

  const [hasEndDate, setHasEndDate] = useState(false)

  const updateSchedule = (field: keyof RecurringSchedule, value: any) => {
    const updatedSchedule = { ...schedule, [field]: value }
    setSchedule(updatedSchedule)
    onScheduleChange(updatedSchedule)
  }

  const getNextInvoiceDate = () => {
    const { frequency, startDate } = schedule

    switch (frequency) {
      case "weekly":
        return addWeeks(startDate, 1)
      case "monthly":
        return addMonths(startDate, 1)
      case "quarterly":
        return addMonths(startDate, 3)
      case "annually":
        return addMonths(startDate, 12)
      default:
        return startDate
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch id="recurring-toggle" checked={true} onCheckedChange={() => {}} />
        <Label htmlFor="recurring-toggle" className="font-medium">
          Set up recurring invoice
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select
            value={schedule.frequency}
            onValueChange={(value: "weekly" | "monthly" | "quarterly" | "annually") =>
              updateSchedule("frequency", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {schedule.startDate ? format(schedule.startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={schedule.startDate}
                onSelect={(date) => date && updateSchedule("startDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="end-date-toggle"
          checked={hasEndDate}
          onCheckedChange={(checked) => {
            setHasEndDate(checked)
            updateSchedule("endDate", checked ? addMonths(new Date(), 12) : null)
          }}
        />
        <Label htmlFor="end-date-toggle">Set end date</Label>
      </div>

      {hasEndDate && (
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {schedule.endDate ? format(schedule.endDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={schedule.endDate || undefined}
                onSelect={(date) => updateSchedule("endDate", date)}
                initialFocus
                disabled={(date) => date < schedule.startDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="send-invoice"
              checked={schedule.sendInvoice}
              onCheckedChange={(checked) => updateSchedule("sendInvoice", checked)}
            />
            <Label htmlFor="send-invoice">Automatically send invoice</Label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-charge"
              checked={schedule.autoCharge}
              onCheckedChange={(checked) => updateSchedule("autoCharge", checked)}
              disabled={!customerHasPaymentMethod}
            />
            <Label htmlFor="auto-charge" className={!customerHasPaymentMethod ? "text-gray-400" : ""}>
              Automatically charge customer
            </Label>
          </div>
        </div>

        {!customerHasPaymentMethod && schedule.autoCharge && (
          <div className="text-amber-600 text-sm">
            Customer needs to add a payment method to enable automatic charging.
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="text-sm font-medium">Next invoice will be created on:</div>
        <div className="text-lg font-semibold mt-1">{format(getNextInvoiceDate(), "MMMM d, yyyy")}</div>
      </div>
    </div>
  )
}
