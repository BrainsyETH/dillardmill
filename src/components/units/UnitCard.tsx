'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { RentalUnit } from '@/lib/sanity/schemas';
import { getUnitUrl } from '@/lib/utils/slugToUrl';
import { urlFor } from '@/lib/sanity/client';

interface UnitCardProps {
  unit: RentalUnit;
  featured?: boolean;
}

export function UnitCard({ unit, featured = false }: UnitCardProps) {
  // Get image URL from Sanity
  const imageUrl = unit.featuredImage?.image 
    ? urlFor(unit.featuredImage.image).width(800).height(600).url()
    : unit.images?.[0]?.image 
      ? urlFor(unit.images[0].image).width(800).height(600).url()
      : null;

  const imageAlt = unit.featuredImage?.alt || unit.images?.[0]?.alt || unit.name;

  // Featured unit - large horizontal layout
  if (featured) {
    return (
      <Link href={getUnitUrl(unit.slug.current)} className="group block">
        <motion.div 
          className="card-featured shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500"
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2 h-80 md:h-auto relative overflow-hidden">
              {/* Featured Badge */}
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-gradient-to-r from-brand-copper to-brand-copper-dark text-white px-6 py-3 rounded-full text-base font-bold shadow-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured Property
                </div>
              </div>

              {/* Image or Gradient Placeholder */}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-olive/30 to-brand-sand/50" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="md:w-1/2 p-8 md:p-10">
              <h3 className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-brand-forest group-hover:text-brand-copper transition-colors">
                {unit.name}
              </h3>

              {unit.shortDescription && (
                <p className="text-lg text-brand-charcoal mb-6 leading-relaxed">
                  {unit.shortDescription}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6 text-base font-semibold text-brand-forest">
                {unit.bedrooms && unit.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{unit.bedrooms} {unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                  </div>
                )}
                {unit.bathrooms && unit.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <span>{unit.bathrooms} {unit.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                  </div>
                )}
                {unit.maxGuests && unit.maxGuests > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Sleeps {unit.maxGuests}</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {unit.amenities && unit.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {unit.amenities.slice(0, 5).map((amenity, index) => (
                    <span
                      key={index}
                      className="text-sm bg-white text-brand-forest px-4 py-2 rounded-full border border-brand-sand font-medium"
                    >
                      {amenity.name}
                    </span>
                  ))}
                  {unit.amenities.length > 5 && (
                    <span className="text-sm text-brand-stone px-4 py-2 font-medium">
                      +{unit.amenities.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Price and CTA */}
              <div className="flex items-end justify-between pt-6 border-t border-brand-sand">
                <div>
                  {unit.basePrice && unit.basePrice > 0 && (
                    <div className="font-serif text-4xl font-bold text-brand-copper">
                      ${unit.basePrice}
                      <span className="text-lg font-sans font-normal text-brand-stone">/night</span>
                    </div>
                  )}
                  {unit.cleaningFee && unit.cleaningFee > 0 && (
                    <div className="text-sm text-brand-stone mt-1">
                      +${unit.cleaningFee} cleaning fee
                    </div>
                  )}
                </div>
                <div className="btn btn-primary group-hover:gap-3 transition-all">
                  Book Now
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Regular unit - standard card layout
  return (
    <Link href={getUnitUrl(unit.slug.current)} className="group block h-full">
      <motion.div 
        className="card h-full flex flex-col"
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Image */}
        <div className="h-56 relative overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-sand/60 to-brand-olive/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-serif text-2xl font-semibold mb-2 text-brand-forest group-hover:text-brand-copper transition-colors">
            {unit.name}
          </h3>

          {unit.shortDescription && (
            <p className="text-brand-stone mb-4 line-clamp-2 flex-1">
              {unit.shortDescription}
            </p>
          )}

          <div className="flex items-center gap-4 mb-4 text-sm text-brand-charcoal">
            {unit.bedrooms && unit.bedrooms > 0 && (
              <span>{unit.bedrooms} {unit.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            )}
            {unit.bathrooms && unit.bathrooms > 0 && (
              <>
                <span className="text-brand-sand">•</span>
                <span>{unit.bathrooms} {unit.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
              </>
            )}
            {unit.maxGuests && unit.maxGuests > 0 && (
              <>
                <span className="text-brand-sand">•</span>
                <span>Sleeps {unit.maxGuests}</span>
              </>
            )}
          </div>

          {unit.amenities && unit.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {unit.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="text-xs bg-white text-brand-forest px-3 py-1 rounded-full border border-brand-sand"
                >
                  {amenity.name}
                </span>
              ))}
              {unit.amenities.length > 3 && (
                <span className="text-xs text-brand-stone px-2 py-1">
                  +{unit.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-brand-sand mt-auto">
            <div>
              {unit.basePrice && unit.basePrice > 0 && (
                <div className="font-serif text-2xl font-bold text-brand-forest">
                  ${unit.basePrice}
                  <span className="text-sm font-sans font-normal text-brand-stone">/night</span>
                </div>
              )}
              {unit.cleaningFee && unit.cleaningFee > 0 && (
                <div className="text-xs text-brand-stone">
                  +${unit.cleaningFee} cleaning fee
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-brand-copper font-semibold group-hover:gap-2 transition-all">
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
