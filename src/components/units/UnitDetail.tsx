'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortableText } from '@portabletext/react';
import type { RentalUnit } from '@/lib/sanity/schemas';
import { urlFor } from '@/lib/sanity/client';
import { AmenityList } from './AmenityList';
import { BookingForm } from '../booking/BookingForm';

interface UnitDetailProps {
  unit: RentalUnit;
}

// Portable Text components for rich content rendering
const portableTextComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 text-brand-charcoal leading-relaxed">{children}</p>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="font-serif text-2xl font-semibold text-brand-forest mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-serif text-xl font-semibold text-brand-forest mt-6 mb-3">{children}</h3>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-brand-copper pl-6 italic text-brand-stone my-6">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-brand-charcoal">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-brand-charcoal">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-brand-forest">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    link: ({ value, children }: { value?: { href?: string }, children?: React.ReactNode }) => (
      <a 
        href={value?.href} 
        className="text-brand-copper hover:text-brand-copper-dark underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

export function UnitDetail({ unit }: UnitDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Get images from Sanity
  const images = unit.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-brand-forest mb-4">
          {unit.name}
        </h1>
        {unit.shortDescription && (
          <p className="text-xl text-brand-stone max-w-3xl">{unit.shortDescription}</p>
        )}
      </motion.div>

      {/* Quick Stats Bar */}
      <motion.div 
        className="flex flex-wrap gap-6 mb-10 pb-8 border-b border-brand-sand"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {unit.bedrooms && unit.bedrooms > 0 && (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-semibold text-brand-forest">{unit.bedrooms}</span>
            <span className="text-brand-stone">{unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
          </div>
        )}
        {unit.bathrooms && unit.bathrooms > 0 && (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <span className="font-semibold text-brand-forest">{unit.bathrooms}</span>
            <span className="text-brand-stone">{unit.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
        )}
        {unit.maxGuests && unit.maxGuests > 0 && (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-semibold text-brand-forest">Sleeps {unit.maxGuests}</span>
          </div>
        )}
        {unit.basePrice && unit.basePrice > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-serif text-3xl font-bold text-brand-copper">${unit.basePrice}</span>
            <span className="text-brand-stone">/ night</span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Image Gallery */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Main Image */}
            <div 
              className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => hasImages && setLightboxOpen(true)}
            >
              {hasImages && images[selectedImageIndex]?.image ? (
                <>
                  <Image
                    src={urlFor(images[selectedImageIndex].image).width(1200).height(800).url()}
                    alt={images[selectedImageIndex].alt || unit.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-brand-forest opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to expand
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-sand/60 to-brand-sage/30 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-brand-stone/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-brand-stone">Photos coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {hasImages && images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {images.slice(0, 6).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 md:h-24 rounded-lg overflow-hidden transition-all ${
                      selectedImageIndex === index 
                        ? 'ring-3 ring-brand-copper ring-offset-2' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {img.image && (
                      <Image
                        src={urlFor(img.image).width(200).height(150).url()}
                        alt={img.alt || `${unit.name} image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
                {images.length > 6 && (
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="relative h-20 md:h-24 rounded-lg overflow-hidden bg-brand-forest/80 flex items-center justify-center text-brand-cream font-semibold hover:bg-brand-forest transition-colors"
                  >
                    +{images.length - 6} more
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Description */}
          {unit.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="font-serif text-2xl font-semibold text-brand-forest mb-6">About This Space</h2>
              <div className="prose prose-lg max-w-none">
                {typeof unit.description === 'string' ? (
                  <p className="text-brand-charcoal leading-relaxed">{unit.description}</p>
                ) : Array.isArray(unit.description) && unit.description.length > 0 ? (
                  <PortableText value={unit.description} components={portableTextComponents} />
                ) : null}
              </div>
            </motion.div>
          )}

          {/* Beds Configuration */}
          {unit.beds && unit.beds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="font-serif text-xl font-semibold text-brand-forest mb-4">Sleeping Arrangements</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {unit.beds.map((bed, index) => (
                  <div key={index} className="bg-brand-cream rounded-xl p-4 border border-brand-sand">
                    <svg className="w-8 h-8 text-brand-copper mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                    </svg>
                    <div className="font-semibold text-brand-forest">{bed.count} {bed.type}</div>
                    <div className="text-sm text-brand-stone">{bed.count > 1 ? 'beds' : 'bed'}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Amenities */}
          {unit.amenities && unit.amenities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="font-serif text-2xl font-semibold text-brand-forest mb-6">Amenities</h2>
              <AmenityList amenities={unit.amenities} />
            </motion.div>
          )}

          {/* Location & Contact Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="bg-brand-cream rounded-xl p-6 border border-brand-sand">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-copper/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-brand-forest">Location</h3>
              </div>
              <p className="text-brand-charcoal mb-2">
                126 Dillard Mill Road<br />
                Davisville, MO 65456
              </p>
              <p className="text-sm text-brand-stone">
                Walking distance to historic Dillard Mill State Historic Site
              </p>
            </div>

            <div className="bg-brand-cream rounded-xl p-6 border border-brand-sand">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-copper/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-brand-forest">Questions?</h3>
              </div>
              <p className="text-brand-charcoal mb-3">
                Contact us for more information about your stay.
              </p>
              <a
                href="tel:+13148434321"
                className="inline-flex items-center gap-2 text-brand-copper hover:text-brand-copper-dark font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (314) 843-4321
              </a>
            </div>
          </motion.div>

          {/* Other Booking Options */}
          {(unit.airbnbUrl || unit.vrboUrl || unit.bookingUrl) && (
            <motion.div 
              className="bg-gradient-to-br from-brand-cream to-brand-sand/30 rounded-xl p-6 border border-brand-sand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h3 className="font-serif text-lg font-semibold text-brand-forest mb-4">Also Available On</h3>
              <div className="flex flex-wrap gap-4">
                {unit.airbnbUrl && (
                  <a
                    href={unit.airbnbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline text-sm"
                  >
                    View on Airbnb
                  </a>
                )}
                {unit.vrboUrl && (
                  <a
                    href={unit.vrboUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline text-sm"
                  >
                    View on VRBO
                  </a>
                )}
                {unit.bookingUrl && (
                  <a
                    href={unit.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline text-sm"
                  >
                    View on Hipcamp
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Inline Booking */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="sticky top-24">
            <BookingForm
              unit={{
                _id: unit._id,
                name: unit.name,
                slug: unit.slug,
                basePrice: unit.basePrice || 0,
                cleaningFee: unit.cleaningFee || 0,
                minStay: unit.minStay,
                maxGuests: unit.maxGuests || 1,
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && hasImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-4 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative max-w-5xl max-h-[80vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
              {images[selectedImageIndex]?.image && (
                <Image
                  src={urlFor(images[selectedImageIndex].image).width(1600).height(1200).url()}
                  alt={images[selectedImageIndex].alt || unit.name}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-4 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-4 text-white/70 text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
