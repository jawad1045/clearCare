"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getUsersForExport(
  params: { search?: string; role?: string; acctId?: number } = {}
) {
  const { search = "", role = "all", acctId } = params;

  const where: Prisma.UserWhereInput = {};

  if (search.trim()) {
    where.OR = [
      { contactFirstName: { contains: search, mode: "insensitive" } },
      { contactLastName: { contains: search, mode: "insensitive" } },
      { contactEmail: { contains: search, mode: "insensitive" } },
      { organization: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && role !== "all") {
    where.userRole = role;
  }

  if (acctId) {
    where.acctId = acctId;
  }

  return prisma.user.findMany({
    where,
    orderBy: { createdDate: "desc" },
    include: {
      company: true,
    },
  });
}

export async function getCompaniesForExport(params: { search?: string; status?: string } = {}) {
  const { search = "", status = "all" } = params;

  const where: Prisma.CompanyWhereInput = {};

  if (search.trim()) {
    where.OR = [
      { organization: { contains: search, mode: "insensitive" } },
      { contactEmail: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }

  return prisma.company.findMany({
    where,
    orderBy: [
      { isActive: "desc" },
      { createdDate: "desc" },
    ],
  });
}
