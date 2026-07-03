"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/locale/use-translation";

export function UsersHeader({ total }: { total: number }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-brand">{t("users.totalUsers")}</span>
        <p className="pl-8 text-2xl font-bold text-brand">{total}</p>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand">{t("users.pageTitle")}</h1>
        <p className="text-muted-foreground">{t("users.pageSubtitle")}</p>
      </div>

      <Button asChild className="px-6 py-5">
        <Link href="/admin/users/create">
          <Plus className="mr-2 h-4 w-4" />
          {t("users.createUser")}
        </Link>
      </Button>
    </div>
  );
}
