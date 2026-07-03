"use client";

import { useState } from "react";
import { Building2, Eye, MapPin, User, FileText, Hash } from "lucide-react";

import { EditCompanyForm } from "@/components/companies/edit-company-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/locale/use-translation";

type Company = {
  id: number;
  organization: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
  contactPhone: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactTitle: string | null;
  notes: string | null;
  createdDate: Date;
};

type Props = { company: Company };

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || <span className="italic text-muted-foreground/50">—</span>}</p>
    </div>
  );
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function ViewTab({ company }: { company: Company }) {
  const { t, locale } = useTranslation();

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <div className="h-1 w-full bg-primary" />
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              {t("companies.detailsTitle")}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {company.organization}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-8">

        <Section icon={Building2} title={t("common.organization")}>
          <div className="sm:col-span-2">
            <InfoRow label={t("common.organizationName")} value={company.organization} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={MapPin} title={t("common.address")}>
          <div className="sm:col-span-2">
            <InfoRow label={t("common.street")} value={company.street} />
          </div>
          <InfoRow label={t("common.city")} value={company.city} />
          <InfoRow label={t("common.state")} value={company.state} />
          <InfoRow label={t("common.zip")} value={company.zip} />
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={User} title={t("common.contactPerson")}>
          <InfoRow label={t("common.firstName")} value={company.contactFirstName} />
          <InfoRow label={t("common.lastName")} value={company.contactLastName} />
          <InfoRow label={t("common.email")} value={company.contactEmail} />
          <InfoRow label={t("common.phone")} value={company.contactPhone} />
          <div className="sm:col-span-2">
            <InfoRow label={t("common.title")} value={company.contactTitle} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={FileText} title={t("common.notes")}>
          <div className="sm:col-span-2">
            <InfoRow label={t("common.notes")} value={company.notes} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={Hash} title={t("common.recordInfo")}>
          <InfoRow label={t("companies.companyId")} value={String(company.id)} />
          <InfoRow
            label={t("common.created")}
            value={new Date(company.createdDate).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          />
        </Section>

      </CardContent>
    </Card>
  );
}

export function CompanyDetailTabs({ company }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"view" | "edit">("view");

  return (
    <div className="space-y-4">
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("view")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "view"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-4 w-4" />
          {t("common.view")}
        </button>
        <button
          onClick={() => setTab("edit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "edit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          {t("common.edit")}
        </button>
      </div>

      {tab === "view" ? <ViewTab company={company} /> : <EditCompanyForm company={company} />}
    </div>
  );
}
