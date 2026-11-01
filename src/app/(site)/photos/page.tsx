import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { propertyPhotos, unitPhotos } from "@/lib/content/property";
import { getAllUnits } from "@/lib/sanity/queries";
export const metadata = { title: "Photographs | Pine Valley at Dillard Mill" };
export default async function Photos() {
  const units = await getAllUnits();
  const cmsPhotos = units
    .filter((u) => u.images?.length)
    .flatMap((u) => unitPhotos(u).map((p) => ({ ...p, group: u.name })));
  const images = [...propertyPhotos, ...cmsPhotos];
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
