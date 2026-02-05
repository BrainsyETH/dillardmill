import Link from 'next/link';
import { getAllGalleryImages } from '@/lib/sanity/queries';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

export const metadata = {
  title: 'Photo Gallery | Pine Valley at Dillard Mill',
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-forest to-brand-forest/90 text-brand-parchment py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-copper/10 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
              SEE FOR YOURSELF
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
              Photo Gallery
            </h1>
            <p className="text-xl text-brand-sand/90 leading-relaxed">
              Explore Pine Valley through photos of our unique accommodations, beautiful property,
              and the stunning natural surroundings of Missouri's Mark Twain National Forest.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {allImages.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 rounded-full bg-brand-sand/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-brand-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-brand-forest mb-4">
                Photos Coming Soon
              </h2>
              <p className="text-brand-stone mb-8">
                Gallery images are being uploaded to our CMS. Check back soon to see photos of our beautiful property and accommodations!
              </p>
              <Link href="/lodging" className="btn btn-primary">
                View Our Accommodations
              </Link>
            </div>
          </div>
        ) : (
          <>
            <GalleryGrid images={allImages} galleryData={galleryData} />

            <div className="mt-16 text-center">
              <p className="text-brand-stone text-lg mb-6">
                Ready to experience Pine Valley in person?
              </p>
              <Link href="/lodging" className="btn btn-primary">
                View Our Accommodations
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
