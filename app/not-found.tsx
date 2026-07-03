import type { Metadata } from "next";
import Link from "next/link";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default async function NotFound() {
  const { t } = await getServerTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-bold text-muted-foreground">404</div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("app.notFoundTitle")}
        </h1>
        <p className="text-muted-foreground text-base">
          {t("app.notFoundBody")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium shadow hover:bg-primary/90 transition-colors"
        >
          {t("app.goHome")}
        </Link>
      </div>
    </div>
  );
}
