"use client";

import { useState } from "react";
import { Eye, Settings, User, Building2, Paperclip, UserCheck, Activity, FileOutput, Calendar, Hash, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UpdateStatusForm } from "@/components/referrals/status-selector";
import { BHResultUploader } from "@/components/referrals/bh-result-uploader";
import { parseAttachment } from "@/lib/parse-attachment";
import { getStatusColor } from "@/lib/referral-statuses";

type MentalHealthReferral = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  last4SSN: string;
  email: string | null;
  gender: string;
  status: string;
  appointmentDate: Date | null;
  pdfReport: string | null;
  clientAttachments: string[];
  referName: string;
  dateOfReferral: Date;
  notes: string | null;
  lastUpdated: Date;
  user: {
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
    contactPhone: string;
  };
  company: {
    organization: string;
  };
};

type Props = {
  referral: MentalHealthReferral;
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || <span className="italic text-muted-foreground/50">—</span>}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
    </div>
  );
}

function ViewTab({ referral }: { referral: MentalHealthReferral }) {
  const formatDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;

  return (
    <div className="space-y-4">

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Client */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={User} title="Client" />
            <CardDescription className="text-xs">Personal details</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label="Full Name" value={`${referral.firstName} ${referral.lastName}`} />
            <InfoRow label="Phone" value={referral.phone} />
            <InfoRow label="Email" value={referral.email} />
            <InfoRow label="Gender" value={referral.gender} />
            <InfoRow label="Last 4 of SSN" value={`••${referral.last4SSN}`} />
          </CardContent>
        </Card>

        {/* Referral Info */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Calendar} title="Referral Info" />
            <CardDescription className="text-xs">Dates & referrer</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label="Date of Referral" value={formatDate(referral.dateOfReferral)} />
            <InfoRow label="Appointment Date" value={formatDate(referral.appointmentDate)} />
            <InfoRow label="Referred By" value={referral.referName} />
          </CardContent>
        </Card>

        {/* Submitted By */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={UserCheck} title="Submitted By" />
            <CardDescription className="text-xs">Referring contact</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label="Name" value={`${referral.user.contactFirstName} ${referral.user.contactLastName}`} />
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <a href={`mailto:${referral.user.contactEmail}`} className="text-sm text-primary hover:underline">
                {referral.user.contactEmail}
              </a>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Phone</p>
              <a href={`tel:${referral.user.contactPhone}`} className="text-sm text-primary hover:underline">
                {referral.user.contactPhone}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Building2} title="Organization" />
            <CardDescription className="text-xs">Associated company</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <InfoRow label="Organization" value={referral.company.organization} />
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Paperclip} title="Attachments" />
            <CardDescription className="text-xs">
              {referral.clientAttachments.length} file{referral.clientAttachments.length !== 1 ? "s" : ""} attached
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {referral.clientAttachments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No attachments</p>
            ) : (
              <ul className="space-y-2">
                {referral.clientAttachments.map((stored, index) => {
                  const { name, url } = parseAttachment(stored, index);
                  return (
                    <li key={stored}>
                      <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2 text-sm">
                        <Link href={url} target="_blank" rel="noopener noreferrer">
                          <Paperclip className="h-3.5 w-3.5 shrink-0" />
                          {name}
                        </Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Notes */}
      {referral.notes && (
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={FileText} title="Notes" />
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">{referral.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Record Info */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Hash} title="Record Info" />
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
          <InfoRow label="Referral ID" value={String(referral.id)} />
          <InfoRow label="Status" value={referral.status} />
          <InfoRow label="Last Updated" value={formatDate(referral.lastUpdated)} />
        </CardContent>
      </Card>

    </div>
  );
}

function ManageTab({ referral }: { referral: MentalHealthReferral }) {
  return (
    <div className="space-y-4">

      {/* Result PDF */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={FileOutput} title="Result / Report" />
          <CardDescription className="text-xs">Upload the result PDF for this referral</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <BHResultUploader referralId={referral.id} currentResult={referral.pdfReport ?? null} />
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Activity} title="Status Management" />
          <CardDescription className="text-xs">Update the referral workflow status</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Current Status
              </p>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: getStatusColor(referral.status) + "22",
                  color: getStatusColor(referral.status),
                  borderColor: getStatusColor(referral.status) + "55",
                }}
                className="capitalize text-sm px-3 py-1"
              >
                {referral.status.toLowerCase()}
              </Badge>
            </div>
            <div className="sm:min-w-70">
              <UpdateStatusForm referralId={referral.id} currentStatus={referral.status} isBH />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export function MentalHealthReferralDetailTabs({ referral }: Props) {
  const [tab, setTab] = useState<"view" | "manage">("view");

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
          onClick={() => setTab("manage")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "manage"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          Manage
        </button>
      </div>

      {tab === "view" ? (
        <ViewTab referral={referral} />
      ) : (
        <ManageTab referral={referral} />
      )}
    </div>
  );
}
