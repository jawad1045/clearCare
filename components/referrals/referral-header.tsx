"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/locale/use-translation";

type Props = {
  basePath: string;
  title?: string;
  subtitle?: string;
  showCreate?: boolean;
  total?: number;
};

export function ReferralHeader({ basePath, title, subtitle, showCreate = true, total }: Props) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("referrals.pageTitleDefault");

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-brand">{resolvedTitle}</h1>
        <p className="text-muted-foreground">{subtitle ?? `${t("referrals.manageSubtitlePrefix")} ${resolvedTitle.toLowerCase()}`}</p>
      </div>

      {showCreate && (
        <div className="text-center">
          <span className="text-sm font-medium text-brand">{t("referrals.totalPrefix")} {resolvedTitle}</span>
          <p className="text-2xl font-bold text-brand">{total ?? 0}</p>
        </div>
      )}

      <div>
        {showCreate ? (
          <Link href={`${basePath}/create`}>
            <Button className="px-6 py-5">
              <Plus className="mr-2 h-4 w-4" />
              {t("referrals.createPrefix")} {resolvedTitle}
            </Button>
          </Link>
        ) : (
          <div className="w-32" />
        )}
      </div>
    </div>
  );
}
