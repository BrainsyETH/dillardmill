import Link from "next/link";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import photos from "@/lib/content/photos.json";
export const metadata = { title: "Tiny cabins | Pine Valley" };
export default function TinyCabins() {
  const images = photos
    .filter((p) => p.sourcePages.includes("tiny-cabins"))
    .map((p) => ({
      src: p.src,
      alt: p.alt || "Tiny cabin at Pine Valley",
      caption: /^Slide/.test(p.caption) ? "" : p.caption,
    }));
  return (
    <div className="page-shell section-space">
      <p className="eyebrow mb-4">Part of the Farm</p>
      <h1 className="page-title mb-6">The tiny cabins.</h1>
      <p className="text-lg max-w-2xl mb-9">
        Two small cabins, each with a queen bed and air conditioning. Both use
        the shared, climate-controlled Hippy Showers &amp; Bathrooms. Available
        when you book the Farm.
      </p>
      <GalleryGrid images={images} compact />
      <Link className="btn btn-primary mt-9" href="/book-the-farm">
        Explore the whole Farm
      </Link>
    </div>
  );
}
