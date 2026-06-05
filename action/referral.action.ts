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
  return prisma.referral.count();
}