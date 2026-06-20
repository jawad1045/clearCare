import type { Metadata } from "next";
import {Barlow} from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const barlowFont = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: "600"
});

export const metadata: Metadata = {
  title: "HWP Portal",
  description: "Healthcare Workforce Portal",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        <Toaster richColors />
      </body>
    </html>
  );
}
