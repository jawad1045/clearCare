import { getCompanyById } from "@/action/company.action";

import { EditCompanyForm } from "@/components/companies/edit-company-form";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  const company =
    await getCompanyById(
      Number(id)
    );

  if (!company) {
    return (
      <div>
        Company not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6">
      <EditCompanyForm
        company={company}
      />
    </div>
  );
}