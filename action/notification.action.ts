"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function createNotification(opts: {
  userId: number;
  title: string;
  message: string;
  type: "referral_submitted" | "status_changed";
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: opts.userId,
      title: opts.title,
      message: opts.message,
      type: opts.type,
      link: opts.link,
    },
  });
}

export async function getMyNotifications() {
  const session = await getCurrentUser();
  if (!session) return [];

  return prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function getUnreadCount() {
  const session = await getCurrentUser();
  if (!session) return 0;

  return prisma.notification.count({
    where: { userId: session.id, read: false },
  });
}

export async function markNotificationRead(id: number) {
  const session = await getCurrentUser();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { id, userId: session.id },
    data: { read: true },
  });
}

export async function markAllNotificationsRead() {
  const session = await getCurrentUser();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });
}
