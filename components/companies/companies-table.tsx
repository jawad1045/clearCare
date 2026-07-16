"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/locale/use-translation";

type Company = {
  id: number;
  organization: string;
  city: string;
  state: string;
  contactEmail: string;
  contactPhone: string;
  createdDate: Date;
};

export function CompaniesTable({ companies }: { companies: Company[] }) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-sidebar text-xs text-sidebar-foreground">
            <th className="px-4 py-3 text-left font-semibold">{t("common.organization")}</th>
            <th className="px-4 py-3 text-left font-semibold">{t("common.email")}</th>
            <th className="px-4 py-3 text-left font-semibold">{t("common.phone")}</th>
            <th className="px-4 py-3 text-left font-semibold">{t("common.location")}</th>
            <th className="px-4 py-3 text-left font-semibold">{t("common.created")}</th>
            <th className="px-4 py-3 text-left font-semibold">{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {companies.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                {t("companies.noCompaniesFound")}
              </td>
            </tr>
          ) : (
            companies.map((company, i) => (
              <tr
                key={company.id}
                className={`transition-colors hover:bg-muted/50 ${i % 2 === 1 ? "table-row-even" : "table-row-odd"}`}
              >
                <td className="px-4 py-3 font-medium">{company.organization}</td>
                <td className="px-4 py-3 text-muted-foreground">{company.contactEmail}</td>
                <td className="px-4 py-3 text-muted-foreground">{company.contactPhone}</td>
                <td className="px-4 py-3 text-muted-foreground">{company.city}, {company.state}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(company.createdDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/companies/${company.id}/edit`}>
                    <Button size="sm" variant="outline">{t("common.edit")}</Button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
