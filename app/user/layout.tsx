import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar/navebar";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";
import { getSessionTimeoutMinutes } from "@/action/settings.action";
import { IdleTimeoutWatcher } from "@/components/session/idle-timeout-watcher";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.role === "Admin") {
    redirect("/admin");
  }

  const dbUser = await getUserById(user.id);

  if (dbUser?.mustChangePassword) {
    redirect("/change-password");
  }

  const name = dbUser ? `${dbUser.contactFirstName} ${dbUser.contactLastName}` : "User";
  const sessionTimeoutMinutes = await getSessionTimeoutMinutes();

  return (
    <div className="min-h-full flex flex-col">
      <IdleTimeoutWatcher timeoutMinutes={sessionTimeoutMinutes} />
      <Navbar role="user" name={name} />
      {children}
    </div>
  );
}
