"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCompanyTitles() {
  const titles = await prisma.companyTitle.findMany({
    orderBy: { createdAt: "asc" },
  });
  return titles.map((t) => ({ id: t.id, name: t.name }));
}

export async function createCompanyTitle(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Title cannot be empty" };
  }

  try {
    const title = await prisma.companyTitle.create({
      data: { name: trimmed },
    });
    revalidatePath("/companies"); // adjust to wherever this form lives
    return { data: { id: title.id, name: title.name } };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "This title already exists" };
    }
    return { error: "Failed to add title" };
  }
}

export async function deleteCompanyTitle(id: number) {
  try {
    await prisma.companyTitle.delete({ where: { id } });
    revalidatePath("/companies");
    return { success: true };
  } catch {
    return { error: "Failed to delete title" };
  }
}