import { getCompanies } from "@/action/company.action";

import { CompanyHeader } from "@/components/companies/company-header";
import { CompaniesClient } from "@/components/companies/companies-client";

export default async function CompaniesPage() {
  const initialData =
    await getCompanies();

  return (
    <div className="space-y-6 p-6">
      <CompanyHeader />

      <CompaniesClient
        initialData={initialData}
      />
    </div>
  );
}