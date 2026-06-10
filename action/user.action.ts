"use server";

import { PrismaClient, Prisma } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import bcrypt from "bcryptjs";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  // Role Filter
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
        acctId: true,
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

/* ------------------------------------------------ */
/* GET COMPANIES */
/* ------------------------------------------------ */

export async function getCompanies() {
  return prisma.company.findMany({
    select: {
      id: true,
      organization: true,
      street: true,
      city: true,
      state: true,
      zip: true,
    },
    orderBy: {
      organization: "asc",
    },
  });
}

/* ------------------------------------------------ */
/* CREATE USER */
/* ------------------------------------------------ */

export async function createUser(
  formData: FormData
) {
  const acctId = Number(
    formData.get("acctId")
  );

  const firstName =
    formData.get("firstName") as string;

  const lastName =
    formData.get("lastName") as string;

  const email =
    formData.get("email") as string;

  const phone =
    formData.get("phone") as string;

  const title =
    formData.get("title") as string;

  const role =
    formData.get("role") as string;

  const password =
    formData.get("password") as string;

  const confirmPassword =
    formData.get(
      "confirmPassword"
    ) as string;

  // Password Match
  if (password !== confirmPassword) {
    throw new Error(
      "Passwords do not match"
    );
  }

  // Company Check
  const company =
    await prisma.company.findUnique({
      where: {
        id: acctId,
      },
    });

  if (!company) {
    throw new Error(
      "Selected company not found"
    );
  }

  // Email Check
  const existingUser =
    await prisma.user.findUnique({
      where: {
        contactEmail: email,
      },
    });

  if (existingUser) {
    throw new Error(
      "Email already exists"
    );
  }

  // Hash Password
  const hashedPassword =
    await bcrypt.hash(
      password,
      12
    );

  // Create User
  await prisma.user.create({
  data: {
    acctId,

    organization: company.organization,

    street: company.street,
    city: company.city,
    state: company.state,
    zip: company.zip,

    contactFirstName: firstName,
    contactLastName: lastName,
    contactEmail: email,
    contactPhone: phone,

    contactTitle: title || null,

    userRole: role,

    password: hashedPassword,

    isActive: true,
  },
});

  revalidatePath(
    "/admin/users"
  );

  redirect("/admin/users");
}

export async function getUserById(
  id: number
) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

//update user
export async function updateUser(
  id: number,
  formData: FormData
) {
  const firstName =
    formData.get(
      "firstName"
    ) as string;

  const lastName =
    formData.get(
      "lastName"
    ) as string;

  const email =
    formData.get(
      "email"
    ) as string;

  const phone =
    formData.get(
      "phone"
    ) as string;

  const title =
    formData.get(
      "title"
    ) as string;

  const role =
    formData.get(
      "role"
    ) as string;

  const isActive =
    formData.get(
      "isActive"
    ) === "true";

  await prisma.user.update({
    where: {
      id,
    },

    data: {
      contactFirstName:
        firstName,

      contactLastName:
        lastName,

      contactEmail:
        email,

      contactPhone:
        phone,

      contactTitle:
        title,

      userRole:
        role,

      isActive,
    },
  });

  revalidatePath(
    "/admin/users"
  );

  redirect(
    "/admin/users"
  );
}

//get all user
export async function getUsersCount() {
  return prisma.user.count();
}

import { getCurrentUser } from "@/lib/auth";

export async function updateProfileName(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  if (!firstName?.trim() || !lastName?.trim()) {
    throw new Error("First and last name are required");
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { contactFirstName: firstName.trim(), contactLastName: lastName.trim() },
  });

  revalidatePath("/admin/profile");
  revalidatePath("/user/profile");
}

export async function resetUserPassword(userId: number, newPassword: string) {
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  revalidatePath("/admin/users");
}

export async function updateProfilePassword(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { password: hashed },
  });
}