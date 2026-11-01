import imported from "./journal.json";
import { getBlogPosts, getBlogPostBySlug } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import type { PortableTextBlock } from "@portabletext/react";
export interface JournalEntry {
  id: string;
  title: string;
  path: string;
  publishedAt: string;
  excerpt?: string;
  cover?: string | null;
  body?: string;
  portableBody?: PortableTextBlock[];
}
export async function journalEntries(): Promise<JournalEntry[]> {
  const cms = await getBlogPosts();
  const entries = new Map<string, JournalEntry>(
    imported.map((p) => [p.path, p]),
  );
  for (const p of cms)
    entries.set(`/thoughts/${p.slug.current}`, {
      id: p._id,
      title: p.title,
      path: `/thoughts/${p.slug.current}`,
      publishedAt: p.publishedAt,
      excerpt: p.excerpt,
      cover: p.coverImage ? urlFor(p.coverImage).width(1200).url() : null,
    });
  return [...entries.values()].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}
export async function journalEntry(slug: string): Promise<JournalEntry | null> {
  const p = await getBlogPostBySlug(slug);
  if (p)
    return {
      id: p._id,
      title: p.title,
      path: `/thoughts/${p.slug.current}`,
      publishedAt: p.publishedAt,
      excerpt: p.excerpt,
      cover: p.coverImage ? urlFor(p.coverImage).width(1600).url() : null,
      portableBody: p.body,
    };
  return imported.find((p) => p.path === `/thoughts/${slug}`) || null;
}
