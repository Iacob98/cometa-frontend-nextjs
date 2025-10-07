import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],

  // Increase timeout for slow Supabase queries
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
