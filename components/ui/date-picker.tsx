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
  disabled?: boolean
  initialDate?: string | Date | null
  allowFutureDates?: boolean
}

function parseInitialDate(initialDate?: string | Date | null): {
  date: Date | undefined;
  display: string;
  iso: string;
} {
  if (!initialDate) {
    return { date: undefined, display: "", iso: "" };
  }

  // If it's a Date instance
  if (initialDate instanceof Date || Object.prototype.toString.call(initialDate) === "[object Date]") {
    const d = initialDate as Date;
    if (isNaN(d.getTime())) {
      return { date: undefined, display: "", iso: "" };
    }

    const isUtcMidnight =
      d.getUTCHours() === 0 &&
      d.getUTCMinutes() === 0 &&
      d.getUTCSeconds() === 0 &&
      d.getUTCMilliseconds() === 0;

    const y = isUtcMidnight ? d.getUTCFullYear() : d.getFullYear();
    const m = isUtcMidnight ? d.getUTCMonth() : d.getMonth();
    const day = isUtcMidnight ? d.getUTCDate() : d.getDate();

    const mm = String(m + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const yyyy = String(y);

    return {
      date: new Date(y, m, day),
      display: `${mm}/${dd}/${yyyy}`,
      iso: `${yyyy}-${mm}-${dd}`,
    };
  }

  // If it's a string
  if (typeof initialDate === "string") {
    const trimmed = initialDate.trim();
    if (!trimmed) {
      return { date: undefined, display: "", iso: "" };
    }

    // Matches YYYY-MM-DD or YYYY-MM-DDT...
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const y = Number(ymdMatch[1]);
      const m = Number(ymdMatch[2]) - 1;
      const day = Number(ymdMatch[3]);
      const mm = ymdMatch[2];
      const dd = ymdMatch[3];
      const yyyy = ymdMatch[1];
      const localDate = new Date(y, m, day);
      if (!isNaN(localDate.getTime())) {
        return {
          date: localDate,
          display: `${mm}/${dd}/${yyyy}`,
          iso: `${yyyy}-${mm}-${dd}`,
        };
      }
    }

    // Matches MM/DD/YYYY
    const mdyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (mdyMatch) {
      const m = Number(mdyMatch[1]) - 1;
      const day = Number(mdyMatch[2]);
      const y = Number(mdyMatch[3]);
      const localDate = new Date(y, m, day);
      if (!isNaN(localDate.getTime())) {
        return {
          date: localDate,
          display: `${mdyMatch[1]}/${mdyMatch[2]}/${mdyMatch[3]}`,
          iso: `${mdyMatch[3]}-${mdyMatch[1]}-${mdyMatch[2]}`,
        };
      }
    }

    // Fallback date parsing
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const isUtcMidnight =
        d.getUTCHours() === 0 &&
        d.getUTCMinutes() === 0 &&
        d.getUTCSeconds() === 0 &&
        d.getUTCMilliseconds() === 0;

      const y = isUtcMidnight ? d.getUTCFullYear() : d.getFullYear();
      const m = isUtcMidnight ? d.getUTCMonth() : d.getMonth();
      const day = isUtcMidnight ? d.getUTCDate() : d.getDate();

      const mm = String(m + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const yyyy = String(y);

      return {
        date: new Date(y, m, day),
        display: `${mm}/${dd}/${yyyy}`,
        iso: `${yyyy}-${mm}-${dd}`,
      };
    }
  }

  return { date: undefined, display: "", iso: "" };
}

export function DatePicker({
  name,
  required,
  onDateChange,
  className,
  disabled,
  initialDate,
  allowFutureDates,
}: DatePickerProps) {
  const initialParsed = React.useMemo(() => parseInitialDate(initialDate), [initialDate]);

  const [selected, setSelected] = React.useState<Date | undefined>(initialParsed.date);
  const [display, setDisplay] = React.useState(initialParsed.display);
  const [iso, setIso] = React.useState(initialParsed.iso);

  const prevInitialKeyRef = React.useRef(initialParsed.iso);
  React.useEffect(() => {
    if (prevInitialKeyRef.current !== initialParsed.iso) {
      prevInitialKeyRef.current = initialParsed.iso;
      setSelected(initialParsed.date);
      setDisplay(initialParsed.display);
      setIso(initialParsed.iso);
    }
  }, [initialParsed]);
  
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
      const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        if (!isNaN(d.getTime())) {
          setSelected(d);
          setIso(isoStr);
          onDateChange?.(isoStr);
          return;
        }
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
        disabled={disabled}
        className={cn("pr-10", className)}
      />
      <Popover
        open={disabled ? false : open}
        onOpenChange={(value) => {
          if (!disabled) {
            setOpen(value);
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
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
            endMonth={allowFutureDates ? undefined : new Date()}
            disabled={allowFutureDates ? undefined : (d) => d > new Date()}
            defaultMonth={selected ?? new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}