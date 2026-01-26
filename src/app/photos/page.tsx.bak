import { getAllGalleryImages } from '@/lib/sanity/queries';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

export const metadata = {
  title: 'Photo Gallery | Pine Valley',
  description: 'Browse photos of our accommodations, property, and the beautiful Missouri Ozarks surrounding Pine Valley.',
};

export default async function GalleryPage() {
  const galleryData = await getAllGalleryImages();

  // Flatten all images from all units into a single array
  const allImages = galleryData.flatMap((unit: any) =>
    unit.images && Array.isArray(unit.images)
      ? unit.images.map((img: any) => ({
          ...img,
          unitName: unit.unitName,
          unitSlug: unit.unitSlug,
        }))
      : []
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Photo Gallery</h1>
        <p className="text-xl text-gray-600">
          Explore Pine Valley through photos of our unique accommodations, beautiful property,
          and the stunning natural surroundings of Missouri's Mark Twain National Forest.
        </p>
      </div>

      {allImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-8">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-xl text-gray-600 mb-4">
              Gallery images are being uploaded to our CMS.
            </p>
            <p className="text-gray-500">
              Check back soon to see photos of our beautiful property and accommodations!
            </p>
          </div>
        </div>
      ) : (
        <>
          <GalleryGrid images={allImages} galleryData={galleryData} />

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Ready to experience Pine Valley in person?
            </p>
            <a
              href="/lodging"
              className="inline-block bg-stone-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-stone-700 transition-colors"
            >
              View Our Accommodations
            </a>
          </div>
        </>
      )}
    </div>
  );
}
