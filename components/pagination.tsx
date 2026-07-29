"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/locale/use-translation";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  total?: number;
};

// Builds a compact list of page numbers with "..." gaps, e.g.
// [1, "...", 4, 5, 6, "...", 42]
function getPaginationRange(current: number, total: number, siblingCount = 1) {
  const totalNumbers = siblingCount * 2 + 5;

  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const range: (number | "...")[] = [1];

  if (showLeftDots) {
    range.push("...");
  } else {
    for (let i = 2; i < leftSibling; i++) range.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== total) range.push(i);
  }

  if (showRightDots) {
    range.push("...");
  } else {
    for (let i = rightSibling + 1; i < total; i++) range.push(i);
  }

  range.push(total);

  return range;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled,
  total,
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const range = getPaginationRange(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {typeof total === "number"
          ? `Page ${page} of ${totalPages} (${total} total)`
          : `Page ${page} of ${totalPages}`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || disabled}
          onClick={() => onPageChange(1)}
        >
          «
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || disabled}
          onClick={() => onPageChange(page - 1)}
        >
          {t("common.previous")}
        </Button>

        {range.map((item, idx) =>
          item === "..." ? (
            <span
              key={`dots-${idx}`}
              className="px-2 text-sm text-muted-foreground select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              size="sm"
              variant={page === item ? "default" : "outline"}
              disabled={disabled}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || disabled}
          onClick={() => onPageChange(page + 1)}
        >
          {t("common.next")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || disabled}
          onClick={() => onPageChange(totalPages)}
        >
          »
        </Button>
      </div>
    </div>
  );
}