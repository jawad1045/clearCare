"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserTitles() {
  const titles = await prisma.userTitle.findMany({
    orderBy: { createdAt: "asc" },
  });
  return titles.map((t) => ({ id: t.id, name: t.name }));
}

export async function createUserTitle(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Title cannot be empty" };
  }

  try {
    const title = await prisma.userTitle.create({
      data: { name: trimmed },
    });
    revalidatePath("/admin/users");
    return { data: { id: title.id, name: title.name } };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "This title already exists" };
    }
    return { error: "Failed to add title" };
  }
}

export async function deleteUserTitle(id: number) {
  try {
    await prisma.userTitle.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Failed to delete title" };
  }
}