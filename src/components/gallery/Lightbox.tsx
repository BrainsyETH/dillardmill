'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface LightboxProps {
  image: {
    image: any;
    caption?: string;
    alt?: string;
    unitName: string;
    unitSlug: string;
  };
  currentIndex: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({
  image,
  currentIndex,
  total,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Previous image"
        >
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {currentIndex < total - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Next image"
        >
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Image container */}
      <div className="max-w-7xl max-h-[90vh] w-full mx-4">
        {/* Placeholder - actual image will display once uploaded to Sanity */}
        <div className="bg-stone-700 rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-xl font-semibold mb-2">{image.unitName}</p>
            {image.caption && (
              <p className="text-gray-300">{image.caption}</p>
            )}
          </div>
        </div>

        {/* Image info */}
        <div className="mt-4 text-center">
          <p className="text-white text-sm">
            {currentIndex + 1} / {total}
          </p>
          <Link
            href={`/units/${image.unitSlug}`}
            className="text-stone-300 hover:text-white text-sm underline mt-2 inline-block"
          >
            View {image.unitName} →
          </Link>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70">
        <span className="hidden md:inline">
          Use arrow keys or click arrows to navigate • Press ESC to close
        </span>
        <span className="md:hidden">
          Tap arrows to navigate
        </span>
      </div>
    </div>
  );
}
