"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { completeForcedPasswordChange, continueWithCurrentPassword } from "@/action/user.action";
import { toast } from "sonner";

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
  const router = useRouter();
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isContinuing, setIsContinuing] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: PasswordFormValues) {
    setError(null);
    setIsLoading(true);
    try {
      const result = await completeForcedPasswordChange(values.newPassword, values.confirmPassword);
      toast.success("Password updated successfully!");
      router.push(result.redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsLoading(false);
    }
  }

  async function onContinue() {
    setError(null);
    setIsContinuing(true);
    try {
      const result = await continueWithCurrentPassword();
      router.push(result.redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsContinuing(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 h-full overflow-none"
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #0d6e72 0%, #073d42 45%, #030e12 100%)",
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg shadow-2xl shadow-black/60">
        <div className="h-0.75 bg-linear-to-r from-primary via-accent to-primary" />

        <div className="bg-white px-10 py-10">
          <div className="mb-6">
            <h2 className="text-[17px] font-semibold text-gray-900">Set a new password</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Your administrator reset your password. Choose a new one to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  disabled={isLoading || isContinuing}
                  {...register("newPassword")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat new password"
                  disabled={isLoading || isContinuing}
                  {...register("confirmPassword")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isContinuing}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Continue"
              )}
            </button>

            <button
              type="button"
              onClick={onContinue}
              disabled={isLoading || isContinuing}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isContinuing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Continuing...
                </>
              ) : (
                "Continue with this password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
