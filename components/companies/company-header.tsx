import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CompanyHeader({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-brand">Total Companies</span>
        <p className="pl-8 text-2xl font-bold text-brand">{total}</p>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand">Companies</h1>
        <p className="text-muted-foreground">Manage organizations</p>
      </div>

      <Link href="/admin/companies/create">
        <Button className="px-6 py-5">Add Company</Button>
      </Link>
    </div>
  );
}