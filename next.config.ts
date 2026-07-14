import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['@remotion/bundler', '@remotion/renderer', 'esbuild'],
};

export default nextConfig;
