'use client';

import { useState } from 'react';
import { Lightbox } from './Lightbox';

interface GalleryImage {
  image: any;
  caption?: string;
  alt?: string;
  featured?: boolean;
  unitName: string;
  unitSlug: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  galleryData: any[];
}

export function GalleryGrid({ images, galleryData }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Get unique unit names for filter buttons
  const units = Array.from(new Set(galleryData.map((unit) => ({
    name: unit.unitName,
    slug: unit.unitSlug,
  })))).filter((unit) => unit.name);

  // Filter images based on selected unit
  const filteredImages = filter === 'all'
    ? images
    : images.filter((img) => img.unitSlug === filter);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredImages.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const goToPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-stone-800 text-white'
              : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
          }`}
        >
          All Photos
        </button>
        {units.map((unit) => (
          <button
            key={unit.slug}
            onClick={() => setFilter(unit.slug)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === unit.slug
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
            }`}
          >
            {unit.name}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map((img, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square bg-stone-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Placeholder for image - actual images will show once uploaded to Sanity */}
            <div className="absolute inset-0 flex items-center justify-center text-stone-400">
              <span className="text-sm">Image from {img.unitName}</span>
            </div>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

            {/* Caption */}
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">{img.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No images found for this filter.
        </div>
      )}

      {/* Lightbox */}
      {selectedIndex !== null && (
        <Lightbox
          image={filteredImages[selectedIndex]}
          currentIndex={selectedIndex}
          total={filteredImages.length}
          onClose={closeLightbox}
          onNext={goToNext}
          onPrev={goToPrev}
        />
      )}
    </>
  );
}
