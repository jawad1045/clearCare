"use client";

import { useEffect, useState, useTransition } from "react";

import { getUsers } from "@/action/user.action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UsersTable } from "./users-tabel";
import { useTranslation } from "@/locale/use-translation";

type Props = {
  initialData: Awaited<ReturnType<typeof getUsers>>;
};

export function UsersClient({ initialData }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);

  const [data, setData] = useState(initialData);

  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search, 500);
  const [limit, setLimit] = useState(20);
  useEffect(() => {
    startTransition(async () => {
      const result = await getUsers({
        search: debouncedSearch,
        role,
        page,
        limit,
      });

      setData(result);
    });
  }, [debouncedSearch, role, page, limit]);

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder={t("users.searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        <Select
          value={String(limit)}
          onValueChange={(value) => {
            setLimit(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isPending && (
        <p className="text-sm text-muted-foreground">
          {t("users.loadingUsers")}
        </p>
      )}

      {/* Table */}
      <UsersTable users={data.users} />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            {t("common.previous")}
          </Button>

          {Array.from(
            { length: data.totalPages },
            (_, i) => i + 1
          ).map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={
                page === pageNumber
                  ? "default"
                  : "outline"
              }
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={page === data.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}