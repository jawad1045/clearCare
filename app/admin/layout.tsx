import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar/navebar";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";
import { getSessionTimeoutMinutes } from "@/action/settings.action";
import { IdleTimeoutWatcher } from "@/components/session/idle-timeout-watcher";
import { triggerPendingDigestIfDue24h } from "@/action/pending-digest.action";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user || user.role !== "Admin") {
    redirect("/user");
  }

  const dbUser = await getUserById(user.id);

  if (dbUser?.mustChangePassword) {
    redirect("/change-password");
  }

  const name = dbUser ? `${dbUser.contactFirstName} ${dbUser.contactLastName}` : "Admin";
  const sessionTimeoutMinutes = await getSessionTimeoutMinutes();

  // Non-blocking check: if 24 hours have elapsed since last digest, send email automatically
  triggerPendingDigestIfDue24h().catch(() => {});

  return (
    <div className="min-h-full flex flex-col">
      <IdleTimeoutWatcher timeoutMinutes={sessionTimeoutMinutes} />
      <Navbar role="admin" name={name} />
      {children}
    </div>
  );
}
