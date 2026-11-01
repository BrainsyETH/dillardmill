import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { journalEntry } from "@/lib/content/journal";
type Props = { params: Promise<{ slug: string[] }> };
export async function generateMetadata({ params }: Props) {
  const p = await journalEntry((await params).slug.join("/"));
  return p
    ? {
        title: `${p.title} | Pine Valley`,
        description: p.excerpt,
        alternates: { canonical: p.path },
      }
    : {};
}
export default async function Post({ params }: Props) {
  const p = await journalEntry((await params).slug.join("/"));
  if (!p) notFound();
  return (
    <article className="page-shell section-space">
      <div className="max-w-3xl mx-auto">
        <Link className="text-link" href="/thoughts">
          ← Thoughts
        </Link>
        <p className="eyebrow mt-9 mb-5">
          Published{" "}
          {new Date(p.publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
        </p>
        <h1 className="page-title mb-10">{p.title}</h1>
        {p.portableBody ? (
          <div className="prose-content journal-body">
            <PortableText value={p.portableBody} />
          </div>
        ) : (
          <div
            className="prose-content journal-body"
            dangerouslySetInnerHTML={{ __html: p.body || "" }}
          />
        )}
      </div>
    </article>
  );
}
