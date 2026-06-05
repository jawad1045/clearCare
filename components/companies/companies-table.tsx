import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

type Company = {
  id: number;
  organization: string;
  city: string;
  state: string;
  contactEmail: string;
  contactPhone: string;
  createdDate: Date;
};

export function CompaniesTable({
  companies,
}: {
  companies: Company[];
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center"
              >
                No companies found
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  {company.organization}
                </TableCell>

                <TableCell>
                  {company.contactEmail}
                </TableCell>

                <TableCell>
                  {company.contactPhone}
                </TableCell>

                <TableCell>
                  {company.city},{" "}
                  {company.state}
                </TableCell>

                <TableCell>
                  {new Date(
                    company.createdDate
                  ).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <Link
                    href={`/admin/companies/${company.id}/edit`}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      Edit
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