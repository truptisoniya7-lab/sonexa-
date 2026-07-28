import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["pg", "yt-search"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/express',
      },
    ]
  }
};

export default nextConfig;
