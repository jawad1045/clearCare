"use client";

import { useEffect, useState, useTransition } from "react";

import { getCompanies } from "@/action/company.action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useDebounce } from "@/hooks/use-debounce";
import { CompaniesTable } from "./companies-table";

type Props = {
  initialData: Awaited<ReturnType<typeof getCompanies>>;
};

export function CompaniesClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [data, setData] = useState(initialData);

  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(search, 500);

  const [status, setStatus] = useState("all");

  useEffect(() => {
    startTransition(async () => {
      const result = await getCompanies({
        search: debouncedSearch,
        page,
        limit,
        status,
      });

      setData(result);
    });
  }, [debouncedSearch, page, limit]);


  return (
    <div className="space-y-6">

      <div className="flex gap-4">
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="border rounded px-3"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>


      {isPending && (
        <p className="text-sm text-muted-foreground">
          Loading companies...
        </p>
      )}


      <CompaniesTable companies={data.companies} />


      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">

          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>


          {Array.from(
            { length: data.totalPages },
            (_, i) => i + 1
          ).map((number) => (
            <Button
              key={number}
              variant={page === number ? "default" : "outline"}
              onClick={() => setPage(number)}
            >
              {number}
            </Button>
          ))}


          <Button
            variant="outline"
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>

        </div>
      )}

    </div>
  );
}