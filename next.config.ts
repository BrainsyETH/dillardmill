import type { NextConfig } from "next";

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
      // Squarespace → Next.js URL redirects
      {
        source: '/local-attractions',
        destination: '/the-area',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/thoughts/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
