"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MONTH_KEYS, MONTH_LABEL_KEYS } from "@/lib/referral-filters";
import { useTranslation } from "@/locale/use-translation";

export function MonthFilter({ paramKey = "month" }: { paramKey?: string }) {
  const { t } = useTranslation();
  const MONTHS = MONTH_KEYS.map((k) => t(MONTH_LABEL_KEYS[k]).slice(0, 3));
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "";

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(currentYear);

  function select(monthIndex: number) {
    const val = `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, val);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function clear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramKey);
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectedYear = current ? parseInt(current.split("-")[0], 10) : null;
  const selectedMonth = current ? parseInt(current.split("-")[1], 10) - 1 : null;

  const label =
    selectedYear !== null && selectedMonth !== null
      ? `${MONTHS[selectedMonth]} ${selectedYear}`
      : null;

  return (
    <div className="flex items-center gap-1">
      {label && (
        <button
          onClick={clear}
          className="text-muted-foreground hover:text-foreground"
          aria-label={t("charts.clearFilterAria")}
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-xs">
            <CalendarIcon className="h-3 w-3" />
            {label ?? t("charts.allTime")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="end">
          {/* Year navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={() => setViewYear((y) => y - 1)}
              disabled={false}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium">{viewYear}</span>
            <button
              onClick={() => setViewYear((y) => Math.min(y + 1, currentYear))}
              disabled={viewYear >= currentYear}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((name, i) => {
              const disabled = viewYear === currentYear && i > currentMonth;
              const selected = selectedYear === viewYear && selectedMonth === i;
              return (
                <button
                  key={name}
                  disabled={disabled}
                  onClick={() => select(i)}
                  className={[
                    "rounded-md py-1.5 text-xs font-medium transition-colors",
                    disabled
                      ? "cursor-not-allowed text-muted-foreground/40"
                      : selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground",
                  ].join(" ")}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
