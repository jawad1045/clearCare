import Link from "next/link";
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

export function CompaniesTable({ companies }: { companies: Company[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-sidebar text-xs text-sidebar-foreground">
            <th className="px-4 py-3 text-left font-semibold">Organization</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Phone</th>
            <th className="px-4 py-3 text-left font-semibold">Location</th>
            <th className="px-4 py-3 text-left font-semibold">Created</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {companies.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                No companies found
              </td>
            </tr>
          ) : (
            companies.map((company, i) => (
              <tr
                key={company.id}
                className="transition-colors hover:bg-muted/50"
                style={i % 2 === 1 ? { backgroundColor: "rgba(0,122,125,0.08)" } : undefined}
              >
                <td className="px-4 py-3 font-medium">{company.organization}</td>
                <td className="px-4 py-3 text-muted-foreground">{company.contactEmail}</td>
                <td className="px-4 py-3 text-muted-foreground">{company.contactPhone}</td>
                <td className="px-4 py-3 text-muted-foreground">{company.city}, {company.state}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(company.createdDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/companies/${company.id}/edit`}>
                    <Button size="sm" variant="outline">Edit</Button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
