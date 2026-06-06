"use client";

import Link from "next/link";

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

export function AdminReferralsTable({
  referrals,
  basePath,
}: Props) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>

            <TableHead>
              Patient
            </TableHead>

            <TableHead>
              Submitted By
            </TableHead>

            <TableHead>
              Company
            </TableHead>

            <TableHead>
              Service
            </TableHead>

            <TableHead>
              Priority
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Date
            </TableHead>

            <TableHead className="w-30">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {referrals.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center"
              >
                No referrals found
              </TableCell>
            </TableRow>
          ) : (
            referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell>
                  #{referral.id}
                </TableCell>

                <TableCell>
                  {referral.patientFirstName}{" "}
                  {referral.patientLastName}
                </TableCell>

                <TableCell>
                  {
                    referral.user
                      .contactFirstName
                  }{" "}
                  {
                    referral.user
                      .contactLastName
                  }
                </TableCell>

                <TableCell>
                  {
                    referral.company
                      .organization
                  }
                </TableCell>

                <TableCell>
                  {referral.serviceType}
                </TableCell>

                <TableCell>
                  {referral.priority}
                </TableCell>

                <TableCell>
                  <Badge>
                    {referral.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {new Date(
                    referral.dateOfReferral
                  ).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <Link
                    href={`${basePath}/${referral.id}`}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}