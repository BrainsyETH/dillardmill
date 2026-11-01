import imported from "./journal.json";

// Journal posts live in journal.json (imported from the original site, with
// their original paths). Add a post by appending an entry and its images.
export interface JournalEntry {
  id: string;
  title: string;
  path: string;
  publishedAt: string;
  excerpt?: string;
  cover?: string | null;
  body?: string;
}

export async function journalEntries(): Promise<JournalEntry[]> {
  return [...imported].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function journalEntry(slug: string): Promise<JournalEntry | null> {
  return imported.find((p) => p.path === `/thoughts/${slug}`) || null;
}
