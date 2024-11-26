/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true // Temporarily ignore type errors during build
  },
  eslint: {
    ignoreDuringBuilds: true // Temporarily ignore ESLint during build
  }
}

module.exports = nextConfig
