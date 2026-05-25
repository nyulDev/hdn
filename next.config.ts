import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Updated QuoPpn schema - now stores: tanggal, noQuo, noPt, noPenawaran, pn, satuan, unitPriceNew, totalNew
  // Using fresh PrismaClient per request to avoid schema cache issues
  experimental: {
    // Turbopack configuration
  },
};

export default nextConfig;
