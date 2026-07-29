import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:5000'}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
