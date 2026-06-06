import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar/navebar";
import { getCurrentUser } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-full flex flex-col">
      <Navbar role={user.role === "Admin" ? "admin" : "user"} />
      {children}
    </div>
  );
}
