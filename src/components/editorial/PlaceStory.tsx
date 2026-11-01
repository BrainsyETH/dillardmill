import Image from "next/image";
import { photo } from "@/lib/content/property";
export function PlaceStory({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  children: React.ReactNode;
}) {
  const p = photo(image);
  return (
    <article className="page-shell section-space">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 md:gap-16 items-end mb-10">
        <div>
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
        </div>
        <p className="text-lg leading-relaxed">{intro}</p>
      </div>
      <figure>
        <div className="relative aspect-[4/3] md:aspect-[2.2/1]">
          <Image
            src={p.src}
            alt={p.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="text-xs text-brand-stone pt-3">
          {p.caption}
        </figcaption>
      </figure>
      <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-10 md:gap-20 prose-content">
        {children}
      </div>
    </article>
  );
}
