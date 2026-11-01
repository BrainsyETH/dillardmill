import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { propertyPhotos } from "@/lib/content/property";
export const metadata = { title: "Photographs | Pine Valley at Dillard Mill" };
export default async function Photos() {
  const images = propertyPhotos;
  return (
    <div className="page-shell section-space">
      <p className="eyebrow mb-4">A look around</p>
      <h1 className="page-title mb-6">
        Pine Valley,
        <br />
        in photographs.
      </h1>
      <p className="text-lg mb-10 max-w-xl">
        The stays, the grounds, and the places we share. Open any photograph for
        a closer look.
      </p>
      <GalleryGrid images={images} />
    </div>
  );
}
