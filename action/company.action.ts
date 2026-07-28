"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type GetCompaniesParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all"; // NEW
};

export async function getCompanies({
  page = 1,
  limit = 20,
  search = "",
  status = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}){
  const skip = (page - 1) * limit;

  const where: Prisma.CompanyWhereInput = {};

  if (search.trim()) {
    where.OR = [
      {
        organization: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        contactEmail: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        city: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Active / Inactive / All Filter
  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }
  // status === "all" -> no filter applied

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { isActive: "desc" }, // active companies show first by default
        { createdDate: "desc" },
      ],
    }),

    prisma.company.count({
      where,
    }),
  ]);

  return {
    companies,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createCompany(
  formData: FormData
) {
  await prisma.company.create({
    data: {
      organization: formData.get("organization") as string,

      street: formData.get("street") as string,

      city: formData.get("city") as string,

      state: formData.get("state") as string,

      zip: formData.get("zip") as string,

      contactPhone: formData.get("phone") as string,

      contactFirstName: formData.get("firstName") as string,

      contactLastName: formData.get("lastName") as string,

      contactEmail: formData.get("email") as string,

      contactTitle: formData.get("title") as string,

      notes: formData.get("notes") as string,

      isActive: true,
    },
  });

  revalidatePath("/admin/companies");

  redirect("/admin/companies");
}

// for one
export async function getCompanyById(
  id: number
) {
  return prisma.company.findUnique({
    where: { id },
  });
}

// update companies
export async function updateCompany(
  id: number,
  formData: FormData
) {
  await prisma.company.update({
    where: {
      id,
    },

    data: {
      organization: formData.get("organization") as string,

      street: formData.get("street") as string,

      city: formData.get("city") as string,

      state: formData.get("state") as string,

      zip: formData.get("zip") as string,

      contactPhone: formData.get("phone") as string,

      contactFirstName: formData.get("firstName") as string,

      contactLastName: formData.get("lastName") as string,

      contactEmail: formData.get("email") as string,

      contactTitle: formData.get("title") as string,

      notes: formData.get("notes") as string,
    },
  });

  revalidatePath("/admin/companies");

  redirect("/admin/companies");
}

/* ------------------------------------------------ */
/* TOGGLE COMPANY ACTIVE STATUS (cascades to users) */
/* ------------------------------------------------ */

export async function toggleCompanyStatus(id: number, isActive: boolean) {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    throw new Error("Company not found");
  }

  // Update the company and all its users' active status together.
  // Deactivating a company deactivates every user tied to it (acctId);
  // reactivating a company reactivates them again.
  await prisma.$transaction([
    prisma.company.update({
      where: { id },
      data: { isActive },
    }),
    prisma.user.updateMany({
      where: { acctId: id },
      data: { isActive },
    }),
  ]);

  revalidatePath("/admin/companies");
  revalidatePath("/admin/users");
}

// count company
export async function getCompaniesCount() {
  return prisma.company.count();
}