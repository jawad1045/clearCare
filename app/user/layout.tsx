import { Navbar } from "@/components/navbar/navebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

      <div className="min-h-full flex flex-col">
        <Navbar role="user"/>
        {children}
      </div>
  )
}
