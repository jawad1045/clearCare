import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
    ],
  },
};
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "My App",
  slogan: process.env.NEXT_PUBLIC_APP_SLOGAN || "Your slogan here",
};

export default nextConfig;