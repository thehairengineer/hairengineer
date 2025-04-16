/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  // Production optimizations
  swcMinify: true, // Use SWC minifier for faster builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production
  },
  experimental: {
    optimizeCss: true, // Optimize CSS
    optimizeServerReact: true, // Optimize server-side React
    scrollRestoration: true, // Improve scroll behavior
  },
  productionBrowserSourceMaps: false, // Disable source maps in production
  // Add compression
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header
}

module.exports = nextConfig 