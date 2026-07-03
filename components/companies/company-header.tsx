"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/locale/use-translation";

export function CompanyHeader({ total }: { total: number }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-brand">{t("companies.totalCompanies")}</span>
        <p className="pl-8 text-2xl font-bold text-brand">{total}</p>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand">{t("companies.pageTitle")}</h1>
        <p className="text-muted-foreground">{t("companies.pageSubtitle")}</p>
      </div>

      <Link href="/admin/companies/create">
        <Button className="px-6 py-5">{t("companies.addCompany")}</Button>
      </Link>
    </div>
  );
}