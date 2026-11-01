import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/studio",
          "/embed/",
          "/booking/confirmation/",
        ],
      },
    ],
    sitemap: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://dillardmill.com").replace(/\/$/, "")}/sitemap.xml`,
  };
}
