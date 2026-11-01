"use client";
import { useState } from "react";
import Image from "next/image";
import type { PropertyPhoto } from "@/lib/content/property";
import { Lightbox } from "./Lightbox";

export function GalleryGrid({
  images,
  compact = false,
}: {
  images: PropertyPhoto[];
  compact?: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState("All photographs");
  const groups = [
    "All photographs",
    ...new Set(
      images.map((i) => i.group).filter((g): g is string => Boolean(g)),
    ),
  ];
  const visible = compact
    ? images.slice(0, 3)
    : images.filter((i) => filter === "All photographs" || i.group === filter);
  if (!images.length) return null;
  return (
    <>
      {!compact && groups.length > 2 && (
        <div
          className="flex flex-wrap gap-x-6 gap-y-2 mb-8 border-b border-brand-sand"
          aria-label="Filter photographs"
        >
          {groups.map((g) => (
            <button
              key={g}
              aria-pressed={g === filter}
              onClick={() => setFilter(g)}
              className={`py-3 border-b-2 ${g === filter ? "border-brand-forest" : "border-transparent text-brand-stone"}`}
            >
              {g}
            </button>
          ))}
        </div>
      )}
      <div
        className={
          compact
            ? "stay-gallery"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8"
        }
      >
        {visible.map((p, i) => (
          <figure
            key={`${p.src}-${i}`}
            className={compact && i === 0 ? "stay-gallery-main" : undefined}
          >
            <button
              onClick={() => setIndex(images.indexOf(p))}
              aria-label={`Open photograph: ${p.alt}`}
              className={`relative block w-full overflow-hidden bg-brand-sand ${compact ? "h-full min-h-44" : "aspect-[4/3]"}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes={
                  compact
                    ? "(max-width: 767px) 100vw, 65vw"
                    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                }
                priority={compact && i === 0}
                className="object-cover"
              />
              {compact && i === 0 && (
                <span className="absolute bottom-4 left-4 bg-white text-brand-charcoal py-2 px-4 text-sm">
                  View all {images.length} photos
                </span>
              )}
            </button>
            {!compact && p.caption && (
              <figcaption className="text-sm pt-2 text-brand-stone">
                {p.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {index !== null && (
        <Lightbox
          images={images}
          index={index}
          onChange={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}
