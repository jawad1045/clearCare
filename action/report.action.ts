"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type ReportRow = {
  id: number;
  type: "Referral" | "BH Referral";
  patientName: string;
  companyName: string;
  serviceType: string;
  status: string;
  dateOfReferral: string;
  referName: string;
  hasPdfResult: boolean;
};

export async function getAdminReportData(): Promise<ReportRow[]> {
  const session = await getCurrentUser();
  if (!session || session.role !== "Admin") {
    return [];
  }

  const [referrals, bhReferrals] = await Promise.all([
    prisma.referral.findMany({
      where: { serviceType: { not: "Behavioral Health" } },
      include: { company: true },
      orderBy: { dateOfReferral: "desc" },
    }),
    prisma.mentalHealthReferral.findMany({
      include: { company: true },
      orderBy: { dateOfReferral: "desc" },
    }),
  ]);

  const rows: ReportRow[] = [
    ...referrals.map((r) => ({
      id: r.id,
      type: "Referral" as const,
      patientName: `${r.patientFirstName} ${r.patientLastName}`,
      companyName: r.company.organization,
      serviceType: r.serviceType,
      status: r.status,
      dateOfReferral: r.dateOfReferral.toISOString(),
      referName: r.referName,
      hasPdfResult: !!r.pdfResult,
    })),
    ...bhReferrals.map((r) => ({
      id: r.id,
      type: "BH Referral" as const,
      patientName: `${r.firstName} ${r.lastName}`,
      companyName: r.company.organization,
      serviceType: "Behavioral Health",
      status: r.status,
      dateOfReferral: r.dateOfReferral.toISOString(),
      referName: r.referName,
      hasPdfResult: !!r.pdfReport,
    })),
  ];

  rows.sort((a, b) => new Date(b.dateOfReferral).getTime() - new Date(a.dateOfReferral).getTime());
  return rows;
}

export async function getUserReportData(): Promise<ReportRow[]> {
  const session = await getCurrentUser();
  if (!session) {
    return [];
  }

  const [referrals, bhReferrals] = await Promise.all([
    prisma.referral.findMany({
      where: { userId: session.id, serviceType: { not: "Behavioral Health" } },
      include: { company: true },
      orderBy: { dateOfReferral: "desc" },
    }),
    prisma.mentalHealthReferral.findMany({
      where: { userId: session.id },
      include: { company: true },
      orderBy: { dateOfReferral: "desc" },
    }),
  ]);

  const rows: ReportRow[] = [
    ...referrals.map((r) => ({
      id: r.id,
      type: "Referral" as const,
      patientName: `${r.patientFirstName} ${r.patientLastName}`,
      companyName: r.company.organization,
      serviceType: r.serviceType,
      status: r.status,
      dateOfReferral: r.dateOfReferral.toISOString(),
      referName: r.referName,
      hasPdfResult: !!r.pdfResult,
    })),
    ...bhReferrals.map((r) => ({
      id: r.id,
      type: "BH Referral" as const,
      patientName: `${r.firstName} ${r.lastName}`,
      companyName: r.company.organization,
      serviceType: "Behavioral Health",
      status: r.status,
      dateOfReferral: r.dateOfReferral.toISOString(),
      referName: r.referName,
      hasPdfResult: !!r.pdfReport,
    })),
  ];

  rows.sort((a, b) => new Date(b.dateOfReferral).getTime() - new Date(a.dateOfReferral).getTime());
  return rows;
}
