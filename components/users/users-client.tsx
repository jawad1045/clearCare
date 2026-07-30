"use client";

import { useEffect, useState, useTransition } from "react";

import { getUsers, getCompanies } from "@/action/user.action";
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
import { Download } from "lucide-react";
import { getUsersForExport } from "@/action/export.action";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { formatDate } from "@/lib/format-date";

type Props = {
  initialData: Awaited<ReturnType<typeof getUsers>>;
};

export function UsersClient({ initialData }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [acctId, setAcctId] = useState<number | null>(null); // NEW

  const [data, setData] = useState(initialData);


  const [companies, setCompanies] = useState<
    Awaited<ReturnType<typeof getCompanies>>
  >([]);



  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search, 500);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active"); // NEW

  // Load companies once for the filter chips
  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch(() => { });
  }, []);

  useEffect(() => {
    startTransition(async () => {
      const result = await getUsers({
        search: debouncedSearch,
        role,
        page,
        limit,
        acctId: acctId ?? undefined,
        isActive: status === "all" ? undefined : status === "active",
      });

      setData(result);
    });
  }, [debouncedSearch, role, page, limit, acctId , status]);

  const handleExportCSV = async () => {
    try {
      const users = await getUsersForExport({
        search: debouncedSearch,
        role,
        acctId: acctId ?? undefined,
      });
      const headers = [
        "User ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Title",
        "Role",
        "Status",
        "Created Date",
        "Organization",
        "Company Address",
        "Company Phone",
        "Company Contact Email",
      ];

      const rows = users.map((user) => [
        user.id,
        user.contactFirstName,
        user.contactLastName,
        user.contactEmail,
        user.contactPhone,
        user.contactTitle || "",
        user.userRole,
        user.isActive ? "Active" : "Inactive",
        formatDate(user.createdDate),
        user.organization,
        user.company
          ? `${user.company.street || ""}, ${user.company.city || ""}, ${user.company.state || ""
          } ${user.company.zip || ""}`
          : "",
        user.company?.contactPhone || "",
        user.company?.contactEmail || "",
      ]);

      exportToCSV("users_export.csv", headers, rows);
    } catch (error) {
      console.error("Export CSV failed", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const users = await getUsersForExport({
        search: debouncedSearch,
        role,
        acctId: acctId ?? undefined,
      });
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Role",
        "Status",
        "Organization",
        "Company Address",
        "Created",
      ];

      const rows = users.map((user) => [
        user.id,
        `${user.contactFirstName} ${user.contactLastName}`,
        user.contactEmail,
        user.contactPhone,
        user.userRole,
        user.isActive ? "Active" : "Inactive",
        user.organization,
        user.company
          ? `${user.company.city || ""}, ${user.company.state || ""}`
          : "",
        formatDate(user.createdDate),
      ]);

      await exportToPDF("users_export.pdf", "Admin Users List", headers, rows);
    } catch (error) {
      console.error("Export PDF failed", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder={t("users.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />

          {/* Company Filter */}
          <Select
            value={acctId ? String(acctId) : "all"}
            onValueChange={(value) => {
              setAcctId(value === "all" ? null : Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder={t("users.filterByCompany")} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                {t("users.allCompanies")}
              </SelectItem>

              {companies.map((company) => (
                <SelectItem
                  key={company.id}
                  value={String(company.id)}
                >
                  {company.organization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
{/* Status Filter */}
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as "active" | "inactive" | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("users.filterByStatus")} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="active">{t("users.active")}</SelectItem>
              <SelectItem value="inactive">{t("users.inactive")}</SelectItem>
              <SelectItem value="all">{t("users.allStatuses")}</SelectItem>
            </SelectContent>
          </Select>
          {/* Page Size */}
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

        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            onClick={handleExportPDF}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isPending && (
        <p className="text-sm text-muted-foreground">
          {t("users.loadingUsers")}
        </p>
      )}

      {/* Table (company chips render inside UsersTable) */}
      <UsersTable
        users={data.users}
        companies={companies}
        activeAcctId={acctId}
        onCompanyChange={(id) => {
          setAcctId(id);
          setPage(1);
        }}
      />

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

          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <Button
                key={pageNumber}
                variant={page === pageNumber ? "default" : "outline"}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            )
          )}

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