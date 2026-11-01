import { readFile } from "node:fs/promises";
import path from "node:path";
export async function weddingBrochure() {
  const pdf = await readFile(
    path.join(
      process.cwd(),
      "src/lib/content/documents/pine-valley-weddings.pdf",
    ),
  );
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="pine-valley-weddings.pdf"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
