import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["pg", "yt-search"],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ]
  }
};

export default nextConfig;
