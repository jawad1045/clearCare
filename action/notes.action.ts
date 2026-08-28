"use server";

import { prisma } from "@/lib/prisma";

export async function getAllAdminNotes() {
  try {
    const [medicalNotes, bhNotes] = await Promise.all([
      prisma.referralNote.findMany({
        include: {
          referral: true,
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.bHReferralNote.findMany({
        include: {
          referral: true,
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const combined = [
      ...medicalNotes.map((n) => ({
        id: n.id,
        noteId: `med-${n.id}`,
        type: "Medical" as const,
        note: n.note,
        status: n.status,
        createdAt: n.createdAt,
        referralId: n.referral.id,
        patientFirstName: n.referral.patientFirstName,
        patientLastName: n.referral.patientLastName,
        referName: n.referral.referName,
      })),
      ...bhNotes.map((n) => ({
        id: n.id,
        noteId: `bh-${n.id}`,
        type: "BH" as const,
        note: n.note,
        status: n.status,
        createdAt: n.createdAt,
        referralId: n.referral.id,
        patientFirstName: n.referral.firstName,
        patientLastName: n.referral.lastName,
        referName: n.referral.referName,
      })),
    ];

    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return combined;
  } catch (error) {
    console.error("Failed to fetch all admin notes:", error);
    return [];
  }
}

export async function getAllUserNotes() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const [medicalNotes, bhNotes] = await Promise.all([
      prisma.referralNote.findMany({
        where: {
          referral: {
            userId: currentUser.id
          }
        },
        include: {
          referral: true,
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.bHReferralNote.findMany({
        where: {
          referral: {
            userId: currentUser.id
          }
        },
        include: {
          referral: true,
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const combined = [
      ...medicalNotes.map((n) => ({
        id: n.id,
        noteId: `med-${n.id}`,
        type: "Medical" as const,
        note: n.note,
        status: n.status,
        createdAt: n.createdAt,
        referralId: n.referral.id,
        patientFirstName: n.referral.patientFirstName,
        patientLastName: n.referral.patientLastName,
        referName: n.referral.referName,
      })),
      ...bhNotes.map((n) => ({
        id: n.id,
        noteId: `bh-${n.id}`,
        type: "BH" as const,
        note: n.note,
        status: n.status,
        createdAt: n.createdAt,
        referralId: n.referral.id,
        patientFirstName: n.referral.firstName,
        patientLastName: n.referral.lastName,
        referName: n.referral.referName,
      })),
    ];

    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return combined;
  } catch (error) {
    console.error("Failed to fetch all user notes:", error);
    return [];
  }
}
