import { z } from "zod";

export const createUserSchema = z
  .object({
    organization: z.string().min(1),

    firstName: z.string().min(1),

    lastName: z.string().min(1),

    email: z.email(),

    phone: z.string().min(1),

    role: z.enum([
      "Admin",
      "User",
    ]),

    password: z
      .string()
      .min(8),

    confirmPassword:
      z.string(),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: [
        "confirmPassword",
      ],
      message:
        "Passwords do not match",
    }
  );