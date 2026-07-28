"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PageSizeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLimit = searchParams.get("limit") ?? "20";

  function onValueChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("limit", value);
    params.set("page", "1"); // Reset to first page

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Rows per page
      </span>

      <Select
        value={currentLimit}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}