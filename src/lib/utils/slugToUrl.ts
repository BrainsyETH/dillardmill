/**
 * Maps stay slugs to their original Squarespace URL paths
 * This preserves SEO by matching the original URL structure
 */
export function getUnitUrl(slug: string): string {
  const slugMap: Record<string, string> = {
    "book-the-farm": "/book-the-farm",
    "original-airstream": "/airstream",
    "the-sebastian": "/sebastian",
    "cozy-cottage": "/cozycottage",
  };

  return slugMap[slug] || `/lodging/${slug}`;
}
