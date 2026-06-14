"use client";

import { useState } from "react";
import { Building2, Eye, MapPin, User, FileText, Hash } from "lucide-react";

import { EditCompanyForm } from "@/components/companies/edit-company-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
              Company Details
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {company.organization}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-8">

        <Section icon={Building2} title="Organization">
          <div className="sm:col-span-2">
            <InfoRow label="Organization Name" value={company.organization} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={MapPin} title="Address">
          <div className="sm:col-span-2">
            <InfoRow label="Street" value={company.street} />
          </div>
          <InfoRow label="City" value={company.city} />
          <InfoRow label="State" value={company.state} />
          <InfoRow label="Zip" value={company.zip} />
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={User} title="Contact Person">
          <InfoRow label="First Name" value={company.contactFirstName} />
          <InfoRow label="Last Name" value={company.contactLastName} />
          <InfoRow label="Email" value={company.contactEmail} />
          <InfoRow label="Phone" value={company.contactPhone} />
          <div className="sm:col-span-2">
            <InfoRow label="Title" value={company.contactTitle} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={FileText} title="Notes">
          <div className="sm:col-span-2">
            <InfoRow label="Notes" value={company.notes} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={Hash} title="Record Info">
          <InfoRow label="Company ID" value={String(company.id)} />
          <InfoRow
            label="Created"
            value={new Date(company.createdDate).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          />
        </Section>

      </CardContent>
    </Card>
  );
}

export function CompanyDetailTabs({ company }: Props) {
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
          View
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
          Edit
        </button>
      </div>

      {tab === "view" ? <ViewTab company={company} /> : <EditCompanyForm company={company} />}
    </div>
  );
}
