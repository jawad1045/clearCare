import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar/navebar";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";

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

  return (
    <div className="min-h-full flex flex-col">
      <Navbar role="admin" name={name} />
      {children}
    </div>
  );
}
