import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "10.2.0.2", "192.168.*.*", "10.*.*.*"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
