import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Allow builds to continue even with ESLint errors
  },
};

export default nextConfig;
