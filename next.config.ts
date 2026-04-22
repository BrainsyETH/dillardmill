import type { NextConfig } from "next";

// Origins allowed to embed /embed/* pages in an iframe. Keep this aligned
// with the Squarespace parent site and any preview hosts you use.
const EMBED_FRAME_ANCESTORS = [
  "'self'",
  'https://dillardmill.com',
  'https://*.dillardmill.com',
  'https://*.squarespace.com',
  'https://*.squarespace-cdn.com',
].join(' ');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // Add URL redirects from Squarespace here during migration
    ];
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${EMBED_FRAME_ANCESTORS}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
