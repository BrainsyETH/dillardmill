import type { NextConfig } from "next";

// Origins allowed to embed /embed/* pages in an iframe. Keep this aligned
// with the Squarespace parent site and any preview hosts you use.
const EMBED_FRAME_ANCESTORS = [
  "'self'",
  "https://dillardmill.com",
  "https://*.dillardmill.com",
  "https://*.squarespace.com",
  "https://*.squarespace-cdn.com",
].join(" ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/cottage", destination: "/cozycottage", permanent: true },
      { source: "/cozy-cottage", destination: "/cozycottage", permanent: true },
      {
        source: "/original-airstream",
        destination: "/airstream",
        permanent: true,
      },
      { source: "/the-sebastian", destination: "/sebastian", permanent: true },
      {
        source: "/floating",
        destination: "/the-area/floating-outfitters",
        permanent: true,
      },
      { source: "/rates", destination: "/lodging", permanent: true },
      {
        source: "/local-attractions",
        destination: "/the-area",
        permanent: true,
      },
      {
        source: "/units/cozy-cottage",
        destination: "/cozycottage",
        permanent: true,
      },
      {
        source: "/units/original-airstream",
        destination: "/airstream",
        permanent: true,
      },
      {
        source: "/units/the-sebastian",
        destination: "/sebastian",
        permanent: true,
      },
      {
        source: "/units/book-the-farm",
        destination: "/book-the-farm",
        permanent: true,
      },
      {
        source: "/units/:slug",
        destination: "/lodging/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${EMBED_FRAME_ANCESTORS}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
