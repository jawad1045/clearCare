import type {
  Company,
  User,
  Referral,
  MentalHealthReferral,
} from "@/lib/generated/prisma/client";
import { formatDate as fmtDate, formatDateTime as fmtDateTime } from "@/lib/format-date";

function fmtBool(value?: boolean | null): string {
  return value ? "Yes" : "No";
}

function fmtList(value?: string[] | null): string {
  return value && value.length ? value.join("; ") : "";
}

function maskSSN(ssn?: string | null): string {
  if (!ssn) return "";
  const digits = ssn.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***-**-${digits.slice(-4)}`;
}

/* ------------------------------- Companies -------------------------------- */

export const COMPANY_HEADERS = [
  "Acct ID",
  "Organization",
  "Street",
  "City",
  "State",
  "Zip",
  "Contact First Name",
  "Contact Last Name",
  "Contact Title",
  "Contact Phone",
  "Contact Email",
  "Notes",
  "Active",
  "Created Date",
];

export function getCompanyExportRows(companies: Company[]): any[][] {
  return companies.map((c) => [
    c.id,
    c.organization,
    c.street ?? "",
    c.city,
    c.state,
    c.zip ?? "",
    c.contactFirstName,
    c.contactLastName,
    c.contactTitle ?? "",
    c.contactPhone,
    c.contactEmail,
    c.notes ?? "",
    fmtBool(c.isActive),
    fmtDate(c.createdDate),
  ]);
}

/* --------------------------------- Users ----------------------------------- */

export type UserWithCompany = User & {
  company?: Pick<Company, "organization"> | null;
};

export const USER_HEADERS = [
  "User ID",
  "Acct ID",
  "Company",
  "Organization (User)",
  "Street",
  "City",
  "State",
  "Zip",
  "Contact First Name",
  "Contact Last Name",
  "Contact Title",
  "Contact Phone",
  "Contact Email",
  "Role",
  "Notes",
  "Active",
  "Must Change Password",
  "Created Date",
];

// NOTE: `password` is deliberately excluded and must never be added here.
export function getUserExportRows(users: UserWithCompany[]): any[][] {
  return users.map((u) => [
    u.id,
    u.acctId ?? "",
    u.company?.organization ?? "",
    u.organization,
    u.street ?? "",
    u.city ?? "",
    u.state ?? "",
    u.zip ?? "",
    u.contactFirstName,
    u.contactLastName,
    u.contactTitle ?? "",
    u.contactPhone,
    u.contactEmail,
    u.userRole,
    u.notes ?? "",
    fmtBool(u.isActive),
    fmtBool(u.mustChangePassword),
    fmtDate(u.createdDate),
  ]);
}

/* ------------------------------- Referrals --------------------------------- */

export type ReferralWithRelations = Referral & {
  company?: Pick<Company, "organization"> | null;
  user?: Pick<User, "contactFirstName" | "contactLastName"> | null;
};

export const REFERRAL_HEADERS = [
  "Referral ID",
  "Company",
  "Submitted By",
  "Service Type",
  "Patient First Name",
  "Patient Last Name",
  "DOB",
  "Grade",
  "Race",
  "Gender",
  "SSN",
  "Type",
  "Priority",
  "Status",
  "Parent First Name",
  "Parent Last Name",
  "Parent Email",
  "Parent Phone",
  "Refer Name",
  "Date of Referral",
  "Date of Patient Contact",
  "Method of Contact",
  "PDF Result",
  "Attachments",
  "Notes",
  "Last Updated",
];

export function getReferralExportRows(
  referrals: ReferralWithRelations[],
  options: { revealSSN?: boolean } = {}
): any[][] {
  const { revealSSN = false } = options;
  return referrals.map((r) => [
    r.id,
    r.company?.organization ?? "",
    r.user ? `${r.user.contactFirstName} ${r.user.contactLastName}` : "",
    r.serviceType,
    r.patientFirstName,
    r.patientLastName,
    fmtDate(r.dob),
    r.grade ?? "",
    r.race,
    r.gender,
    revealSSN ? r.ssn : maskSSN(r.ssn),
    r.type ?? "",
    r.priority ?? "",
    r.status,
    r.parentFirstName ?? "",
    r.parentLastName ?? "",
    r.parentEmail ?? "",
    r.parentPhone ?? "",
    r.referName,
    fmtDate(r.dateOfReferral),
    fmtDate(r.datePatientContact),
    r.methodOfContact ?? "",
    r.pdfResult ?? "",
    fmtList(r.clientAttachments),
    r.notes ?? "",
    fmtDateTime(r.lastUpdated),
  ]);
}

/* ------------------------- Mental Health Referrals --------------------------- */

export type MentalHealthReferralWithRelations = MentalHealthReferral & {
  company?: Pick<Company, "organization"> | null;
  user?: Pick<User, "contactFirstName" | "contactLastName"> | null;
};

export const MENTAL_HEALTH_REFERRAL_HEADERS = [
  "MH ID",
  "Company",
  "Submitted By",
  "First Name",
  "Last Name",
  "Phone",
  "Last 4 SSN",
  "Email",
  "Gender",
  "Status",
  "Referral Type",
  "Grade",
  "Appointment Date",
  "Refer Name",
  "Date of Referral",
  "PDF Report",
  "Attachments",
  "Notes",
  "Last Updated",
];

export function getMentalHealthReferralExportRows(
  referrals: MentalHealthReferralWithRelations[]
): any[][] {
  return referrals.map((r) => [
    r.id,
    r.company?.organization ?? "",
    r.user ? `${r.user.contactFirstName} ${r.user.contactLastName}` : "",
    r.firstName,
    r.lastName,
    r.phone,
    r.last4SSN,
    r.email ?? "",
    r.gender,
    r.status,
    r.referralType ?? "",
    r.grade ?? "",
    fmtDate(r.appointmentDate),
    r.referName,
    fmtDate(r.dateOfReferral),
    r.pdfReport ?? "",
    fmtList(r.clientAttachments),
    r.notes ?? "",
    fmtDateTime(r.lastUpdated),
  ]);
}