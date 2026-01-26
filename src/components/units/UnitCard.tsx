import Link from 'next/link';
import type { RentalUnit } from '@/lib/sanity/schemas';
import { getUnitUrl } from '@/lib/utils/slugToUrl';

interface UnitCardProps {
  unit: RentalUnit;
  featured?: boolean;
}

export function UnitCard({ unit, featured = false }: UnitCardProps) {
  // Featured unit - large horizontal layout
  if (featured) {
    return (
      <Link href={getUnitUrl(unit.slug.current)} className="group block">
        <div className="bg-gradient-to-br from-[#F4F1EB] to-[#CBB8A3] rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 border-4 border-[#CBB8A3]">
          <div className="md:flex">
            {/* Image - larger for featured */}
            <div className="md:w-1/2 h-96 md:h-auto bg-[#CBB8A3] relative overflow-hidden">
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-gradient-to-r from-[#9C5A3C] to-[#7D4830] text-[#F4F1EB] px-6 py-3 rounded-full text-lg font-bold shadow-lg flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured Property
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Content - larger text and spacing */}
            <div className="md:w-1/2 p-10">
              <h3 className="text-4xl font-bold mb-4 text-[#3A2A1E] group-hover:text-[#9C5A3C] transition-colors">
                {unit.name}
              </h3>

              {unit.shortDescription && (
                <p className="text-lg text-[#2B2B2B] mb-6 leading-relaxed">
                  {unit.shortDescription}
                </p>
              )}

              {/* Stats - larger icons and text */}
              <div className="flex flex-wrap items-center gap-6 mb-6 text-base font-semibold text-[#3A2A1E]">
                {unit.bedrooms && unit.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#9C5A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{unit.bedrooms} {unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                  </div>
                )}
                {unit.bathrooms && unit.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#9C5A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{unit.bathrooms} {unit.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                  </div>
                )}
                {unit.maxGuests && unit.maxGuests > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#9C5A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Sleeps {unit.maxGuests}</span>
                  </div>
                )}
              </div>

              {/* Amenities - show more for featured */}
              {unit.amenities && unit.amenities.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {unit.amenities.slice(0, 6).map((amenity, index) => (
                    <span
                      key={index}
                      className="text-sm bg-white text-[#3A2A1E] px-4 py-2 rounded-full border-2 border-[#CBB8A3] font-medium"
                    >
                      {amenity.name}
                    </span>
                  ))}
                  {unit.amenities.length > 6 && (
                    <span className="text-sm text-[#6F8291] px-4 py-2 font-medium">
                      +{unit.amenities.length - 6} more amenities
                    </span>
                  )}
                </div>
              )}

              {/* Price and CTA */}
              <div className="flex items-end justify-between pt-6 border-t-2 border-[#CBB8A3]">
                <div>
                  {unit.basePrice && unit.basePrice > 0 && (
                    <div className="text-4xl font-bold text-[#9C5A3C]">
                      ${unit.basePrice}
                      <span className="text-lg font-normal text-[#6F8291]">/night</span>
                    </div>
                  )}
                  {unit.cleaningFee && unit.cleaningFee > 0 && (
                    <div className="text-sm text-[#6F8291] mt-1">
                      +${unit.cleaningFee} cleaning fee
                    </div>
                  )}
                </div>
                <div className="bg-gradient-to-r from-[#9C5A3C] to-[#7D4830] text-[#F4F1EB] px-8 py-4 rounded-xl font-bold text-lg group-hover:from-[#7D4830] group-hover:to-[#6B3825] transition-all shadow-lg group-hover:shadow-xl flex items-center gap-2">
                  Book Now
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Regular unit - standard card layout
  return (
    <Link href={getUnitUrl(unit.slug.current)} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-[#CBB8A3]">
        {/* Image placeholder - will be replaced with actual images from Sanity */}
        <div className="h-64 bg-[#CBB8A3] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-2 text-[#3A2A1E] group-hover:text-[#9C5A3C] transition-colors">
            {unit.name}
          </h3>

          {unit.shortDescription && (
            <p className="text-[#6F8291] mb-4 line-clamp-2">
              {unit.shortDescription}
            </p>
          )}

          <div className="flex items-center gap-4 mb-4 text-sm text-[#2B2B2B]">
            {unit.bedrooms && unit.bedrooms > 0 && (
              <span>{unit.bedrooms} {unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
            )}
            {unit.bathrooms && unit.bathrooms > 0 && (
              <span>•</span>
            )}
            {unit.bathrooms && unit.bathrooms > 0 && (
              <span>{unit.bathrooms} {unit.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            )}
            {unit.maxGuests && unit.maxGuests > 0 && (
              <>
                <span>•</span>
                <span>Sleeps {unit.maxGuests}</span>
              </>
            )}
          </div>

          {unit.amenities && unit.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {unit.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="text-xs bg-[#F4F1EB] text-[#3A2A1E] px-2 py-1 rounded border border-[#CBB8A3]"
                >
                  {amenity.name}
                </span>
              ))}
              {unit.amenities.length > 3 && (
                <span className="text-xs text-[#6F8291] px-2 py-1">
                  +{unit.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#CBB8A3]">
            <div>
              {unit.basePrice && unit.basePrice > 0 && (
                <div className="text-2xl font-bold text-[#3A2A1E]">
                  ${unit.basePrice}
                  <span className="text-sm font-normal text-[#6F8291]">/night</span>
                </div>
              )}
              {unit.cleaningFee && unit.cleaningFee > 0 && (
                <div className="text-xs text-[#6F8291]">
                  +${unit.cleaningFee} cleaning fee
                </div>
              )}
            </div>
            <span className="text-[#9C5A3C] font-semibold group-hover:text-[#7D4830]">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
