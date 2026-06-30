import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";
import { ChangePasswordForm } from "@/components/change-password-form";

export const metadata: Metadata = {
  title: "Change Password",
};

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    redirect("/");
  }

  if (!dbUser.mustChangePassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background text-foreground">
        <h1 className="text-xl font-bold">Link Expired</h1>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          This password change link has already been used and is no longer valid. Please contact your administrator if you need another temporary password.
        </p>
      </div>
    );
  }

  return <ChangePasswordForm />;
}
