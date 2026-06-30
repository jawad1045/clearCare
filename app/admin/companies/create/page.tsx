import type { Metadata } from "next";
import { CreateCompanyForm } from "@/components/companies/create-company-form";

export const metadata: Metadata = {
  title: "Add Company",
};

export default function CreateCompanyPage() {
  return (
    <div className="max-w-4xl p-6">
      <CreateCompanyForm />
    </div>
  );
}