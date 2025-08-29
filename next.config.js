/** @type {import('next').NextConfig} */
const nextConfig = {
  // Clean minimal config
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig;
