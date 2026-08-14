"use client";

import { useEffect, useState, useTransition } from "react";

import { getCompanies, toggleCompanyStatus } from "@/action/company.action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDebounce } from "@/hooks/use-debounce";
import { CompaniesTable } from "./companies-table";
import { Download } from "lucide-react";
import { getCompaniesForExport } from "@/action/export.action";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { formatDate } from "@/lib/format-date";

type Props = {
  initialData: Awaited<ReturnType<typeof getCompanies>>;
};

export function CompaniesClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active"); // default active

  const [data, setData] = useState(initialData);

  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    let ignore = false;

    startTransition(async () => {
      const result = await getCompanies({
        search: debouncedSearch,
        page,
        limit,
        status,
      });

      if (!ignore) {
        setData(result);
      }
    });

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, page, limit, status]); // status now included

  const handleToggleCompanyActive = async (companyId: number, nextActive: boolean) => {
  await toggleCompanyStatus(companyId, nextActive);
  const result = await getCompanies({
    search: debouncedSearch,
    page,
    limit,
    status, // whatever your status filter state is called here
  });
  setData(result);
};
  const handleExportCSV = async () => {
    try {
      const companies = await getCompaniesForExport({ search: debouncedSearch, status });
      const headers = [
        "Company ID",
        "Organization Name",
        "Street",
        "City",
        "State",
        "Zip",
        "Contact First Name",
        "Contact Last Name",
        "Contact Email",
        "Contact Phone",
        "Contact Title",
        "Status",
        "Created Date",
        "Notes",
      ];

      const rows = companies.map((c) => [
        c.id,
        c.organization,
        c.street || "",
        c.city,
        c.state,
        c.zip || "",
        c.contactFirstName,
        c.contactLastName,
        c.contactEmail,
        c.contactPhone,
        c.contactTitle || "",
        c.isActive ? "Active" : "Inactive",
        formatDate(c.createdDate),
        c.notes || "",
      ]);

      exportToCSV("companies_export.csv", headers, rows);
    } catch (error) {
      console.error("Export CSV failed", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const companies = await getCompaniesForExport({ search: debouncedSearch, status });
      const headers = ["ID", "Organization Name", "Email", "Phone", "Location", "Status", "Created"];

      const rows = companies.map((c) => [
        c.id,
        c.organization,
        c.contactEmail,
        c.contactPhone,
        `${c.city}, ${c.state}`,
        c.isActive ? "Active" : "Inactive",
        formatDate(c.createdDate),
      ]);

      await exportToPDF("companies_export.pdf", "Companies List", headers, rows);
    } catch (error) {
      console.error("Export PDF failed", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
           {/* Status Filter */}
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as "active" | "inactive" | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-3 bg-background text-foreground"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm" className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {isPending && <p className="text-sm text-muted-foreground">Loading companies...</p>}

      <CompaniesTable 
      companies={data.companies}
      onToggleCompanyActive={handleToggleCompanyActive} />

      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((number) => (
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