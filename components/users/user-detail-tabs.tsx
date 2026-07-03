"use client";

import { useState } from "react";
import { UserCog, Eye, Building2, MapPin, ShieldCheck, FileText, Hash, Calendar } from "lucide-react";

import { EditUserForm } from "@/components/users/edit-user-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/locale/use-translation";

type Company = {
  id: number;
  organization: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
};

type User = {
  id: number;
  acctId: number | null;
  organization: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string | null;
  userRole: string;
  notes: string | null;
  isActive: boolean;
  createdDate: Date;
};

type Props = { user: User; companies: Company[] };

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || <span className="text-muted-foreground/50 italic">—</span>}</p>
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

const ROLE_LABEL_KEYS: Record<string, "common.roleAdmin" | "common.roleUser"> = {
  Admin: "common.roleAdmin",
  User: "common.roleUser",
};

function ViewTab({ user }: { user: User }) {
  const { t, locale } = useTranslation();

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <div className="h-1 w-full bg-primary" />
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                {t("users.detailsTitle")}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {user.contactFirstName} {user.contactLastName}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={user.isActive ? "default" : "secondary"}
            className={user.isActive ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10" : ""}
          >
            {user.isActive ? t("common.active") : t("common.inactive")}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-8">

        <Section icon={Building2} title={t("common.organization")}>
          <div className="sm:col-span-2">
            <InfoRow label={t("common.organization")} value={user.organization} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={MapPin} title={t("common.address")}>
          <InfoRow label={t("common.street")} value={user.street} />
          <InfoRow label={t("common.city")} value={user.city} />
          <InfoRow label={t("common.state")} value={user.state} />
          <InfoRow label={t("common.zip")} value={user.zip} />
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={UserCog} title={t("users.contactDetails")}>
          <InfoRow label={t("common.firstName")} value={user.contactFirstName} />
          <InfoRow label={t("common.lastName")} value={user.contactLastName} />
          <InfoRow label={t("common.email")} value={user.contactEmail} />
          <InfoRow label={t("common.phone")} value={user.contactPhone} />
          <div className="sm:col-span-2">
            <InfoRow label={t("common.title")} value={user.contactTitle} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={ShieldCheck} title={t("users.accessAndStatus")}>
          <InfoRow label={t("common.role")} value={ROLE_LABEL_KEYS[user.userRole] ? t(ROLE_LABEL_KEYS[user.userRole]) : user.userRole} />
          <InfoRow label={t("users.accountStatus")} value={user.isActive ? t("common.active") : t("common.inactive")} />
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={FileText} title={t("common.notes")}>
          <div className="sm:col-span-2">
            <InfoRow label={t("common.notes")} value={user.notes} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={Hash} title={t("common.recordInfo")}>
          <InfoRow label={t("users.userId")} value={String(user.id)} />
          <InfoRow label={t("users.accountId")} value={user.acctId ? String(user.acctId) : undefined} />
          <div className="sm:col-span-2">
            <InfoRow
              label={t("common.created")}
              value={new Date(user.createdDate).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            />
          </div>
        </Section>

      </CardContent>
    </Card>
  );
}

export function UserDetailTabs({ user, companies }: Props) {
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
          <UserCog className="h-4 w-4" />
          {t("common.edit")}
        </button>
      </div>

      {tab === "view" ? (
        <ViewTab user={user} />
      ) : (
        <EditUserForm user={user} companies={companies} />
      )}
    </div>
  );
}
