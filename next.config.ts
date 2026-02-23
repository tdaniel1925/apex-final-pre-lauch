import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =============================================
  // Production Optimizations
  // =============================================

  // Security headers for production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // XSS protection (legacy but harmless)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Power draining features - disable for better performance
  poweredByHeader: false,

  // Output for potential Docker deployment
  output: 'standalone',

  // Strict mode for better error catching
  reactStrictMode: true,

  // Experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react'],
  },

  // Turbopack configuration (Next.js 16)
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
