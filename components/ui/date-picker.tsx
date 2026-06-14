"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn, formatDobInput } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  name: string
  required?: boolean
  onDateChange?: (iso: string) => void
  className?: string
}

export function DatePicker({ name, required, onDateChange, className }: DatePickerProps) {
  const [selected, setSelected] = React.useState<Date | undefined>()
  const [display, setDisplay] = React.useState("")
  const [iso, setIso] = React.useState("")
  const [open, setOpen] = React.useState(false)

  function applyDate(date: Date) {
    const dd = String(date.getDate()).padStart(2, "0")
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const yyyy = String(date.getFullYear())
    const isoStr = `${yyyy}-${mm}-${dd}`
    setSelected(date)
    setDisplay(`${mm}/${dd}/${yyyy}`)
    setIso(isoStr)
    onDateChange?.(isoStr)
  }

  function handleCalendarSelect(date: Date | undefined) {
    setOpen(false)
    if (date) {
      applyDate(date)
    } else {
      setSelected(undefined)
      setDisplay("")
      setIso("")
      onDateChange?.("")
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { display: fmt, iso: isoStr } = formatDobInput(e.target.value)
    setDisplay(fmt)
    if (isoStr) {
      const d = new Date(isoStr)
      if (!isNaN(d.getTime())) {
        setSelected(d)
        setIso(isoStr)
        onDateChange?.(isoStr)
        return
      }
    }
    setSelected(undefined)
    setIso("")
    onDateChange?.("")
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={iso} />
      <Input
        type="text"
        placeholder="MM/DD/YYYY"
        value={display}
        onChange={handleInputChange}
        required={required}
        className={cn("pr-10", className)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleCalendarSelect}
            captionLayout="dropdown"
            startMonth={new Date(1920, 0)}
            endMonth={new Date()}
            disabled={(d) => d > new Date()}
            defaultMonth={selected ?? new Date(2000, 0)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
