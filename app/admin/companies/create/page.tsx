import type { Metadata } from "next";
import { CreateCompanyForm } from "@/components/companies/create-company-form";
import { getCompanyTitles } from "@/action/company-title.action";
export const metadata: Metadata = {
  title: "Add Company",
};

export default async function CreateCompanyPage() {
  const titles = await getCompanyTitles();
  return (
    <div className="max-w-4xl p-6">
      <CreateCompanyForm initialCustomTitles={titles} />
    </div>
  );
}