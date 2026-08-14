"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import bcrypt from "bcryptjs";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateTempPassword } from "@/lib/generate-password";
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email";
import { notifySlackNewUser } from "@/lib/slack";
import { getServerTranslation } from "@/locale/server";
import { getCurrentUser } from "@/lib/auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function updateUserStatus(userId: number, isActive: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
}

export async function checkEmailExists(email: string) {
  if (!email) return false;

  const user = await prisma.user.findUnique({
    where: {
      contactEmail: email.toLowerCase(),
    },
    select: {
      id: true,
    },
  });

  return !!user;
}

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  acctId?: number;
  isActive?: boolean;
};

export async function getUsers({
  page = 1,
  limit = 10,
  search = "",
  role,
  acctId,
  isActive,
}: GetUsersParams = {}) {
  const skip = (page - 1) * limit;

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

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdDate: "desc" },
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
        company: {
          select: {
            id: true,
            organization: true,
            street: true,
            city: true,
            state: true,
            zip: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
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

export async function createUser(formData: FormData) {
  const acctIdRaw = formData.get("acctId") as string;
  const acctId = acctIdRaw ? Number(acctIdRaw) : null;

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const title = formData.get("title") as string;
  const role = formData.get("role") as string;
  const notes = formData.get("notes") as string | null;

  const { t } = await getServerTranslation();

  // Company Check — required for non-Admin users
  let company = null;
  if (role === "Admin") {
    if (acctId) {
      company = await prisma.company.findUnique({ where: { id: acctId } });
    }
  } else {
    if (!acctId) {
      throw new Error(t("users.errorCompanyRequired"));
    }
    company = await prisma.company.findUnique({ where: { id: acctId } });
    if (!company) {
      throw new Error(t("users.errorCompanyNotFound"));
    }
  }

  // Email Check
  const existingUser = await prisma.user.findUnique({
    where: {
      contactEmail: email,
    },
  });

  if (existingUser) {
    throw new Error(t("users.errorEmailExists"));
  }

  // Auto-generate temporary password
  const temporaryPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  // Create User
  const user = await prisma.user.create({
    data: {
      acctId: acctId || null,
      organization: company?.organization ?? "",
      street: company?.street ?? null,
      city: company?.city ?? null,
      state: company?.state ?? null,
      zip: company?.zip ?? null,
      contactFirstName: firstName,
      contactLastName: lastName,
      contactEmail: email,
      contactPhone: phone,
      contactTitle: title || null,
      userRole: role,
      password: hashedPassword,
      notes: notes || null,
      isActive: true,
      mustChangePassword: true,
    },
  });

  await sendWelcomeEmail({
    toEmail: user.contactEmail,
    toName: `${user.contactFirstName} ${user.contactLastName}`,
    temporaryPassword,
    loginUrl: `${APP_URL}/`,
  }).catch(() => {});

  const companyName = company?.organization ?? user.organization ?? "Unknown Company";

  await notifySlackNewUser({
    name: `${user.contactFirstName} ${user.contactLastName}`,
    email: user.contactEmail,
    role: user.userRole,
    companyName,
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });
}

// Update User
export async function updateUser(id: number, formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const title = formData.get("title") as string;
  const role = formData.get("role") as string;
  const isActive = formData.get("isActive") === "true";

  await prisma.user.update({
    where: { id },
    data: {
      contactFirstName: firstName,
      contactLastName: lastName,
      contactEmail: email,
      contactPhone: phone,
      contactTitle: title,
      userRole: role,
      isActive,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

// Get All Users Count
export async function getUsersCount() {
  return prisma.user.count();
}

export async function updateProfileName(formData: FormData) {
  const currentUser = await getCurrentUser();
  const { t } = await getServerTranslation();
  if (!currentUser) throw new Error(t("common.errors.unauthorized"));
  if (currentUser.role !== "Admin") {
    throw new Error(t("profile.nameManagedByAdmin"));
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  if (!firstName?.trim() || !lastName?.trim()) {
    throw new Error(t("profile.errorFirstLastNameRequired"));
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      contactFirstName: firstName.trim(),
      contactLastName: lastName.trim(),
    },
  });

  revalidatePath("/admin/profile");
  revalidatePath("/user/profile");
}

export async function resetUserPassword(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const { t } = await getServerTranslation();
    throw new Error(t("users.userNotFound"));
  }

  const temporaryPassword = generateTempPassword();
  const hashed = await bcrypt.hash(temporaryPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed, mustChangePassword: true },
  });

  await sendPasswordResetEmail({
    toEmail: user.contactEmail,
    toName: `${user.contactFirstName} ${user.contactLastName}`,
    temporaryPassword,
    loginUrl: `${APP_URL}/`,
  });

  revalidatePath("/admin/users");
}

export async function completeForcedPasswordChange(
  newPassword: string,
  confirmPassword: string
) {
  const currentUser = await getCurrentUser();
  const { t } = await getServerTranslation();
  if (!currentUser) throw new Error(t("common.errors.unauthorized"));

  const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
  if (!user) throw new Error(t("users.userNotFound"));

  if (!user.mustChangePassword) {
    throw new Error(t("profile.errorLinkExpiredContactAdmin"));
  }

  if (newPassword !== confirmPassword) {
    throw new Error(t("profile.errorPasswordsDoNotMatchPlain"));
  }

  if (newPassword.length < 8) {
    throw new Error(t("profile.errorPasswordMinLengthPlain"));
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { password: hashed, mustChangePassword: false },
  });

  return { redirectTo: user.userRole === "Admin" ? "/admin" : "/user" };
}

export async function continueWithCurrentPassword() {
  const currentUser = await getCurrentUser();
  const { t } = await getServerTranslation();
  if (!currentUser) throw new Error(t("common.errors.unauthorized"));

  const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
  if (!user) throw new Error(t("users.userNotFound"));

  if (!user.mustChangePassword) {
    throw new Error(t("profile.errorLinkExpiredContactAdmin"));
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { mustChangePassword: false },
  });

  return { redirectTo: user.userRole === "Admin" ? "/admin" : "/user" };
}

export async function updateProfilePassword(formData: FormData) {
  const currentUser = await getCurrentUser();
  const { t } = await getServerTranslation();
  if (!currentUser) throw new Error(t("common.errors.unauthorized"));

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    throw new Error(t("profile.passwordsDoNotMatch"));
  }

  if (newPassword.length < 8) {
    throw new Error(t("profile.errorPasswordMinLengthPlain"));
  }

  const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
  if (!user) throw new Error(t("users.userNotFound"));

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error(t("profile.errorCurrentPasswordIncorrect"));

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { password: hashed },
  });
}