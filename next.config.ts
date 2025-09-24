import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // GitHub Pages configuration
  output: 'export',
  trailingSlash: true,
  basePath: '/page-loading',
  assetPrefix: '/page-loading/',
  images: {
    unoptimized: true
  },
  
  // Performance optimizations
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Build optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
