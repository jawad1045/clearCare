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

type Props = {
  initialData: Awaited<ReturnType<typeof getUsers>>;
};

export function UsersClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);

  const [data, setData] = useState(initialData);

  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search, 500);
  useEffect(() => {
  startTransition(async () => {
    const result = await getUsers({
      search: debouncedSearch,
      role,
      page,
    });

    setData(result);
  });
}, [debouncedSearch, role, page]);

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-55">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Roles
            </SelectItem>

            <SelectItem value="Admin">
              Admin
            </SelectItem>

            <SelectItem value="User">
              User
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isPending && (
        <p className="text-sm text-muted-foreground">
          Loading users...
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
            Previous
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
            Next
          </Button>
        </div>
      )}
    </div>
  );
}