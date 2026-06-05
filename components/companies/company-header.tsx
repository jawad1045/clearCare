import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CompanyHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Companies
        </h1>

        <p className="text-muted-foreground">
          Manage organizations
        </p>
      </div>

      <Link
        href="/admin/companies/create"
      >
        <Button>
          Add Company
        </Button>
      </Link>
    </div>
  );
}