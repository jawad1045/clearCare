"use server"

import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@/lib/generated/prisma/client";
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


export async function createReferral(
  formData: FormData
) {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
    });

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  // UploadThing URLs from hidden inputs
  const uploadedFiles =
    formData.getAll(
      "attachments"
    ) as string[];

  if (
    uploadedFiles.length > 5
  ) {
    throw new Error(
      "Maximum 5 files allowed"
    );
  }

  // Encrypt SSN
  const ssn =
    formData.get(
      "ssn"
    ) as string;

  const encryptedSSN =
    await bcrypt.hash(
      ssn,
      10
    );

  await prisma.referral.create({
    data: {
      userId: user.id,

      companyAcctId:
        user.acctId,

      serviceType:
        formData.get(
          "serviceType"
        ) as string,

      type:
        formData.get(
          "type"
        ) as string,

      priority:
        formData.get(
          "priority"
        ) as string,

      parentFirstName:
        formData.get(
          "parentFirstName"
        ) as string,

      parentLastName:
        formData.get(
          "parentLastName"
        ) as string,

      parentEmail:
        formData.get(
          "parentEmail"
        ) as string,

      parentPhone:
        formData.get(
          "parentPhone"
        ) as string,

      patientFirstName:
        formData.get(
          "patientFirstName"
        ) as string,

      patientLastName:
        formData.get(
          "patientLastName"
        ) as string,

      dob: new Date(
        formData.get(
          "dob"
        ) as string
      ),

      grade:
        formData.get(
          "grade"
        ) as string,

      race:
        formData.get(
          "race"
        ) as string,

      gender:
        formData.get(
          "gender"
        ) as string,

      ssn: encryptedSSN,

      notes:
        formData.get(
          "notes"
        ) as string,

      referName: `${user.contactFirstName} ${user.contactLastName}`,

      clientAttachments:
        uploadedFiles,
    },
  });

  revalidatePath(
    "/admin/referrals"
  );

  revalidatePath(
    "/user/referrals"
  );

console.log(
  "CURRENT USER:",
  currentUser
);

  if (
    currentUser.role ===
    "Admin"
  ) {
    redirect(
      "/admin/referrals"
    );
  }

  redirect(
    "/user/referrals"
  );
}


export async function getReferrals() {
  return prisma.referral.findMany({
    where: {
      serviceType: { not: "Behavioral Health" },
    },
    include: {
      user: true,
      company: true,
    },
    orderBy: {
      dateOfReferral: "desc",
    },
  });
}


export async function getMyReferrals() {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  return prisma.referral.findMany({
    where: {
      userId: currentUser.id,
      serviceType: { not: "Behavioral Health" },
    },
    include: {
      company: true,
    },
    orderBy: {
      dateOfReferral: "desc",
    },
  });
}


export async function getReferralsCount() {
  return prisma.referral.count({
    where: { serviceType: { not: "Behavioral Health" } },
  });
}

export async function getBHReferralsCount() {
  return prisma.referral.count({
    where: { serviceType: "Behavioral Health" },
  });
}

export async function updateReferralStatus(
  referralId: number,
  status: string
) {
  await prisma.referral.update({
    where: {
      id: referralId,
    },
    data: {
      status,
    },
  });

  revalidatePath(
    "/admin/referrals"
  );

  revalidatePath(
    `/admin/referrals/${referralId}`
  );

  revalidatePath(
    "/user/referrals"
  );
}

export async function getReferralById(
  id: number
) {
  return prisma.referral.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      company: true,
    },
  });
}

// BH Referral (Behavioral Health) Actions
export async function createBHReferral(
  formData: FormData
) {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
    });

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  // UploadThing URLs from hidden inputs
  const uploadedFiles =
    formData.getAll(
      "attachments"
    ) as string[];

  if (
    uploadedFiles.length > 5
  ) {
    throw new Error(
      "Maximum 5 files allowed"
    );
  }

  // Create BH Referral using Referral model with Behavioral Health service type
  await prisma.referral.create({
    data: {
      userId: user.id,
      companyAcctId: user.acctId,
      serviceType: "Behavioral Health",
      type: formData.get("type") as string,
      priority: formData.get("priority") as string,
      patientFirstName: formData.get(
        "patientFirstName"
      ) as string,
      patientLastName: formData.get(
        "patientLastName"
      ) as string,
      gender: formData.get("gender") as string,
      dob: new Date(
        formData.get("dob") as string
      ),
      grade: formData.get("grade") as string,
      race: formData.get("race") as string,
      ssn: "N/A",
      parentFirstName: formData.get(
        "parentFirstName"
      ) as string,
      parentLastName: formData.get(
        "parentLastName"
      ) as string,
      parentEmail: formData.get(
        "parentEmail"
      ) as string,
      parentPhone: formData.get(
        "parentPhone"
      ) as string,
      referName: `${user.contactFirstName} ${user.contactLastName}`,
      notes: formData.get("notes") as string,
      clientAttachments: uploadedFiles,
    },
  });

  revalidatePath("/admin/bhreferrals");
  revalidatePath("/user/bhreferrals");

  if (
    currentUser.role === "Admin"
  ) {
    redirect("/admin/bhreferrals");
  }

  redirect("/user/bhreferrals");
}

export async function getBHReferrals() {
  return prisma.referral.findMany({
    where: {
      serviceType: "Behavioral Health",
    },
    include: {
      user: true,
      company: true,
    },
    orderBy: {
      dateOfReferral: "desc",
    },
  });
}

export async function getMyBHReferrals() {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  return prisma.referral.findMany({
    where: {
      userId: currentUser.id,
      serviceType: "Behavioral Health",
    },
    include: {
      company: true,
    },
    orderBy: {
      dateOfReferral: "desc",
    },
  });
}

export async function getMyReferralCounts() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const total = await prisma.referral.count({
    where: { userId: currentUser.id, serviceType: { not: "Behavioral Health" } },
  });

  const bh = await prisma.referral.count({
    where: { userId: currentUser.id, serviceType: "Behavioral Health" },
  });

  return { total, bh };
}

export async function getReferralStatusCounts() {
  const rows = await prisma.referral.groupBy({
    by: ["status"],
    where: { serviceType: { not: "Behavioral Health" } },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function getMyReferralStatusCounts() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const rows = await prisma.referral.groupBy({
    by: ["status"],
    where: { userId: currentUser.id, serviceType: { not: "Behavioral Health" } },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function getBHReferralStatusCounts() {
  const rows = await prisma.referral.groupBy({
    by: ["status"],
    where: { serviceType: "Behavioral Health" },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function getMyBHReferralStatusCounts() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const rows = await prisma.referral.groupBy({
    by: ["status"],
    where: { userId: currentUser.id, serviceType: "Behavioral Health" },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function getBHReferralById(
  id: number
) {
  return prisma.referral.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      company: true,
    },
  });
}

export async function updateBHReferralStatus(
  referralId: number,
  status: string
) {
  const currentUser = await getCurrentUser();

  await prisma.referral.update({
    where: {
      id: referralId,
    },
    data: {
      status,
    },
  });

  revalidatePath("/admin/bhreferrals");
  revalidatePath(`/admin/bhreferrals/${referralId}`);
  revalidatePath("/user/bhreferrals");

  // Return the path for the client to navigate to instead of performing a server redirect.
  if (currentUser?.role === "Admin") {
    return "/admin/bhreferrals";
  }

  return "/user/bhreferrals";
}