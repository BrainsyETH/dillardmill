import Image from "next/image";
import Link from "next/link";
import { journalEntries } from "@/lib/content/journal";
export const metadata = { title: "Thoughts from Pine Valley" };
export default async function Thoughts() {
  const posts = await journalEntries();
  return (
    <div className="page-shell section-space">
      <p className="eyebrow mb-4">Notes from Pine Valley</p>
      <h1 className="page-title mb-6">Thoughts.</h1>
      <p className="text-lg mb-12">
        A few things to read before your next trip outside.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {posts.map((p) => (
          <article key={p.path}>
            {p.cover && (
              <Link
                href={p.path}
                className="block relative aspect-[4/3] mb-5"
                aria-hidden="true"
                tabIndex={-1}
              >
                <Image
                  src={p.cover}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover"
                />
              </Link>
            )}
            <p className="text-sm text-brand-stone mb-3">
              {new Date(p.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
            <h2 className="text-3xl mb-4">
              <Link className="hover:underline" href={p.path}>
                {p.title}
              </Link>
            </h2>
            <p className="leading-relaxed">{p.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
