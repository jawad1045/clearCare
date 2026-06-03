"use server";

import { PrismaClient, Prisma } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
};

export async function getUsers(
  {
    page = 1,
    limit = 10,
    search = "",
    role,
  }: GetUsersParams = {}
) {
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  // Search
  if (search.trim()) {
    where.OR = [
  {
    contactFirstName: {
      contains: search,
      mode: "insensitive",
    },
  },
  {
    contactLastName: {
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
    organization: {
      contains: search,
      mode: "insensitive",
    },
  },
];
  }

  // Filter by role
    if (role && role !== "all") {
     where.userRole = role;
    }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdDate: "desc",
      },
      select: {
        id: true,
        organization: true,
        contactFirstName: true,
        contactLastName: true,
        contactEmail: true,
        contactPhone: true,
        contactTitle: true,
        userRole: true,
        isActive: true,
        createdDate: true,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
}