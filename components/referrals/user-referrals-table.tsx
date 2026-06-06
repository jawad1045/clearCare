import Link from "next/link";
import { getMyReferrals } from "@/action/referral.action";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Referral = Awaited<ReturnType<typeof getMyReferrals>>[number];

type Props = {
  referrals: Referral[];
  basePath: string;
};

export function UserReferralsTable({ referrals, basePath }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-6"
              >
                No referrals found.
              </TableCell>
            </TableRow>
          ) : (
            referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell className="font-medium">
                  {referral.patientFirstName ?? "-"}{" "}
                  {referral.patientLastName ?? "-"}
                </TableCell>
                <TableCell>
                  {referral.parentFirstName ?? "-"}{" "}
                  {referral.parentLastName ?? "-"}
                </TableCell>
                <TableCell>{referral.serviceType}</TableCell>
                <TableCell>{referral.priority}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      referral.status === "active" ? "default" : "secondary"
                    }
                  >
                    {referral.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(referral.dateOfReferral).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`${basePath}/${referral.id}`}>
                    <Button variant="outline" size="sm">
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