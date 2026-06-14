"use client";

import { useState } from "react";
import { UserCog, Eye, Building2, MapPin, ShieldCheck, FileText, Hash, Calendar } from "lucide-react";

import { EditUserForm } from "@/components/users/edit-user-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

function ViewTab({ user }: { user: User }) {
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
                User Details
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
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-8">

        <Section icon={Building2} title="Organization">
          <div className="sm:col-span-2">
            <InfoRow label="Organization" value={user.organization} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={MapPin} title="Address">
          <InfoRow label="Street" value={user.street} />
          <InfoRow label="City" value={user.city} />
          <InfoRow label="State" value={user.state} />
          <InfoRow label="Zip" value={user.zip} />
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={UserCog} title="Contact Details">
          <InfoRow label="First Name" value={user.contactFirstName} />
          <InfoRow label="Last Name" value={user.contactLastName} />
          <InfoRow label="Email" value={user.contactEmail} />
          <InfoRow label="Phone" value={user.contactPhone} />
          <div className="sm:col-span-2">
            <InfoRow label="Title" value={user.contactTitle} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={ShieldCheck} title="Access & Status">
          <InfoRow label="Role" value={user.userRole} />
          <InfoRow label="Account Status" value={user.isActive ? "Active" : "Inactive"} />
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={FileText} title="Notes">
          <div className="sm:col-span-2">
            <InfoRow label="Notes" value={user.notes} />
          </div>
        </Section>

        <Separator className="bg-border/60" />

        <Section icon={Hash} title="Record Info">
          <InfoRow label="User ID" value={String(user.id)} />
          <InfoRow label="Account ID" value={user.acctId ? String(user.acctId) : undefined} />
          <div className="sm:col-span-2">
            <InfoRow
              label="Created"
              value={new Date(user.createdDate).toLocaleDateString("en-US", {
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
          <UserCog className="h-4 w-4" />
          Edit
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
