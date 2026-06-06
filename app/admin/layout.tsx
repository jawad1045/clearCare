import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar/navebar";
import { getCurrentUser } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user || user.role !== "Admin") {
    redirect("/user");
  }

  return (
    <div className="min-h-full flex flex-col">
      <Navbar role="admin" />
      {children}
    </div>
  );
}
