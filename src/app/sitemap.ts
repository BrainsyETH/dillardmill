import { eventsPublished } from "@/lib/events/config";
import type { MetadataRoute } from "next";
import { journalEntries } from "@/lib/content/journal";
import { getAllUnits } from "@/lib/stays/queries";
import { getUnitUrl } from "@/lib/utils/slugToUrl";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://dillardmill.com"
  ).replace(/\/$/, "");
  const [posts, units] = await Promise.all([journalEntries(), getAllUnits()]);
  const routes = [
    "",
    "/lodging",
    "/book-the-farm",
    "/our-place",
    "/the-area",
    "/the-area/floating-outfitters",
    "/trails",
    "/dillardmill",
    "/photos",
    "/map",
    "/reviews",
    "/contact",
    "/thoughts",
    "/tiny-cabins",
    ...(eventsPublished() ? ["/weddings", "/events"] : []),
    ...units.map((u) => getUnitUrl(u.slug.current)),
  ];
  return [...new Set(routes)]
    .map((path) => ({ url: `${base}${path}` }))
    .concat(posts.map((p) => ({ url: `${base}${p.path}` })));
}
