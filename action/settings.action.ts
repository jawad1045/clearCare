"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_SESSION_TIMEOUT_MINUTES } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getServerTranslation } from "@/locale/server";

const MIN_TIMEOUT_MINUTES = 1;
const MAX_TIMEOUT_MINUTES = 60 * 24 * 7; // 7 days

export async function getSessionTimeoutMinutes() {
  const setting = await prisma.appSetting.findUnique({ where: { id: 1 } });
  return setting?.sessionTimeoutMinutes ?? DEFAULT_SESSION_TIMEOUT_MINUTES;
}

export async function updateSessionTimeoutMinutes(minutes: number) {
  const currentUser = await getCurrentUser();
  const { t } = await getServerTranslation();

  if (!currentUser || currentUser.role !== "Admin") {
    throw new Error(t("settings.errorOnlyAdminsSessionSettings"));
  }

  if (!Number.isInteger(minutes) || minutes < MIN_TIMEOUT_MINUTES || minutes > MAX_TIMEOUT_MINUTES) {
    throw new Error(t("settings.errorTimeoutRange", { min: MIN_TIMEOUT_MINUTES, max: MAX_TIMEOUT_MINUTES }));
  }

  await prisma.appSetting.upsert({
    where: { id: 1 },
    update: { sessionTimeoutMinutes: minutes },
    create: { id: 1, sessionTimeoutMinutes: minutes },
  });

  revalidatePath("/admin/settings");
}
