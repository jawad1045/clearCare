import type { Metadata } from "next";
import { getCompanyById } from "@/action/company.action";
import { CompanyDetailTabs } from "@/components/companies/company-detail-tabs";

export const metadata: Metadata = {
  title: "Edit Company",
};

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(Number(id));

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="max-w-4xl p-6">
      <CompanyDetailTabs company={company} />
    </div>
  );
}