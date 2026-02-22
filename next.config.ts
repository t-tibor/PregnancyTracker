import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is used for Docker/k3s only.
  // Remove it when deploying to Vercel.
  // output: "standalone",
};

export default nextConfig;
