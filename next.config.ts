import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.59'],
};

export default nextConfig;
