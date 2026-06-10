"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Referral = {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  serviceType: string;
  priority: string;
  status: string;
  dateOfReferral: Date;
  user: {
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
  };
  company: {
    organization: string;
  };
};

type Props = {
  referrals: Referral[];
  basePath: string;
};

export function AdminReferralsTable({ referrals, basePath }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "id-asc" | "id-desc">("newest");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const result = q
      ? referrals.filter((r) =>
          `${r.patientFirstName} ${r.patientLastName}`.toLowerCase().includes(q) ||
          `${r.user.contactFirstName} ${r.user.contactLastName}`.toLowerCase().includes(q) ||
          r.company.organization.toLowerCase().includes(q) ||
          r.serviceType.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
        )
      : [...referrals];

    result.sort((a, b) => {
      if (sort === "newest") return new Date(b.dateOfReferral).getTime() - new Date(a.dateOfReferral).getTime();
      if (sort === "oldest") return new Date(a.dateOfReferral).getTime() - new Date(b.dateOfReferral).getTime();
      if (sort === "id-asc") return a.id - b.id;
      return b.id - a.id; // id-desc
    });

    return result;
  }, [referrals, search, sort]);

  return (
    <div className="space-y-4">
      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by patient, user, company, service, or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest" | "id-asc" | "id-desc")}>
          <SelectTrigger className="w-48">
            <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Date: Newest first</SelectItem>
            <SelectItem value="oldest">Date: Oldest first</SelectItem>
            <SelectItem value="id-asc">ID: Ascending</SelectItem>
            <SelectItem value="id-desc">ID: Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No referrals found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>#{referral.id}</TableCell>

                  <TableCell>
                    {referral.patientFirstName} {referral.patientLastName}
                  </TableCell>

                  <TableCell>
                    {referral.user.contactFirstName} {referral.user.contactLastName}
                  </TableCell>

                  <TableCell>{referral.company.organization}</TableCell>

                  <TableCell>{referral.serviceType}</TableCell>

                  <TableCell>{referral.priority}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        referral.status === "Approved"
                          ? "default"
                          : referral.status === "Rejected"
                          ? "destructive"
                          : referral.status === "Completed"
                          ? "outline"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {referral.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(referral.dateOfReferral).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Link href={`${basePath}/${referral.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}