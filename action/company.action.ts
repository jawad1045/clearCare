"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type GetCompaniesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getCompanies({
  page = 1,
  limit = 10,
  search = "",
}: GetCompaniesParams = {}) {
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

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdDate: "desc",
      },
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
      organization:
        formData.get(
          "organization"
        ) as string,

      street:
        formData.get(
          "street"
        ) as string,

      city:
        formData.get(
          "city"
        ) as string,

      state:
        formData.get(
          "state"
        ) as string,

      zip:
        formData.get(
          "zip"
        ) as string,

      contactPhone:
        formData.get(
          "phone"
        ) as string,

      contactFirstName:
        formData.get(
          "firstName"
        ) as string,

      contactLastName:
        formData.get(
          "lastName"
        ) as string,

      contactEmail:
        formData.get(
          "email"
        ) as string,

      contactTitle:
        formData.get(
          "title"
        ) as string,

      notes:
        formData.get(
          "notes"
        ) as string,
    },
  });

  revalidatePath(
    "/admin/companies"
  );

  redirect(
    "/admin/companies"
  );
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
      organization:
        formData.get(
          "organization"
        ) as string,

      street:
        formData.get(
          "street"
        ) as string,

      city:
        formData.get(
          "city"
        ) as string,

      state:
        formData.get(
          "state"
        ) as string,

      zip:
        formData.get(
          "zip"
        ) as string,

      contactPhone:
        formData.get(
          "phone"
        ) as string,

      contactFirstName:
        formData.get(
          "firstName"
        ) as string,

      contactLastName:
        formData.get(
          "lastName"
        ) as string,

      contactEmail:
        formData.get(
          "email"
        ) as string,

      contactTitle:
        formData.get(
          "title"
        ) as string,

      notes:
        formData.get(
          "notes"
        ) as string,
    },
  });

  revalidatePath(
    "/admin/companies"
  );

  redirect(
    "/admin/companies"
  );
}

// count company
export async function getCompaniesCount() {
  return prisma.company.count();
}