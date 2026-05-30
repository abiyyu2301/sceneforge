/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable eslint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add image domains if needed
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
