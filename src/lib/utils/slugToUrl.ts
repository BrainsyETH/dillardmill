/**
 * Maps Sanity unit slugs to Squarespace URL paths
 * This preserves SEO by matching the original URL structure
 */
export function getUnitUrl(sanitySlug: string): string {
  const slugMap: Record<string, string> = {
    'book-the-farm': '/book-the-farm',
    'original-airstream': '/airstream',
    'the-sebastian': '/sebastian',
    'cozy-cottage': '/cozycottage',
  };

  return slugMap[sanitySlug] || `/lodging/${sanitySlug}`;
}
