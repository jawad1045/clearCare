import { getCompanies } from "@/action/company.action";

import { CompanyHeader } from "@/components/companies/company-header";
import { CompaniesClient } from "@/components/companies/companies-client";

export default async function CompaniesPage() {
  const initialData = await getCompanies();

  return (
    <div className="space-y-6 p-6">
      <CompanyHeader />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Companies</h2>
        <div className="rounded-md border px-4 py-2">
          <span className="text-sm text-muted-foreground">Total Companies</span>
          <p className="text-2xl font-bold">{initialData.total}</p>
        </div>
      </div>

      <CompaniesClient initialData={initialData} />
    </div>
  );
}