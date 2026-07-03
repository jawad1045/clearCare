"use client";

import { useEffect, useState } from "react";

import { getCompanies } from "@/action/company.action";

import { Input } from "@/components/ui/input";

import { CompaniesTable } from "./companies-table";
import { useTranslation } from "@/locale/use-translation";

type Props = {
  initialData: Awaited<
    ReturnType<typeof getCompanies>
  >;
};

export function CompaniesClient({
  initialData,
}: Props) {
  const { t } = useTranslation();

  const [search, setSearch] =
    useState("");

  const [data, setData] =
    useState(initialData);

  useEffect(() => {
    const timeout =
      setTimeout(async () => {
        const result =
          await getCompanies({
            search,
          });

        setData(result);
      }, 500);

    return () =>
      clearTimeout(timeout);
  }, [search]);

  return (
    <div className="space-y-6">
      <Input
        placeholder={t("companies.searchPlaceholder")}
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      <CompaniesTable
        companies={
          data.companies
        }
      />
    </div>
  );
}