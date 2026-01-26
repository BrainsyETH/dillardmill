'use client';

import type { RentalUnit } from '@/lib/sanity/schemas';
import { AmenityList } from './AmenityList';
import { BookingForm } from '../booking/BookingForm';

interface UnitDetailProps {
  unit: RentalUnit;
}

export function UnitDetail({ unit }: UnitDetailProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{unit.name}</h1>
        {unit.shortDescription && (
          <p className="text-xl text-gray-600">{unit.shortDescription}</p>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-stone-200">
        {unit.bedrooms && unit.bedrooms > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{unit.bedrooms}</span>
            <span className="text-gray-600">{unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
          </div>
        )}
        {unit.bathrooms && unit.bathrooms > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{unit.bathrooms}</span>
            <span className="text-gray-600">{unit.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
        )}
        {unit.maxGuests && unit.maxGuests > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Sleeps {unit.maxGuests}</span>
          </div>
        )}
        {unit.basePrice && unit.basePrice > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">${unit.basePrice}</span>
            <span className="text-gray-600">/ night</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery Placeholder */}
          <div className="space-y-4">
            <div className="h-96 bg-stone-200 rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              <div className="h-24 bg-stone-200 rounded" />
              <div className="h-24 bg-stone-200 rounded" />
              <div className="h-24 bg-stone-200 rounded" />
              <div className="h-24 bg-stone-200 rounded" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Images will display once uploaded to Sanity CMS
            </p>
          </div>

          {/* Description */}
          {unit.description && (
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Space</h2>
              <div className="prose prose-stone max-w-none text-gray-700">
                {typeof unit.description === 'string' ? (
                  <p>{unit.description}</p>
                ) : Array.isArray(unit.description) && unit.description.length > 0 ? (
                  // Portable Text content exists
                  <div>Portable Text content (needs @portabletext/react for rendering)</div>
                ) : null}
              </div>
            </div>
          )}

          {/* Beds Configuration */}
          {unit.beds && unit.beds.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-3">Sleeping Arrangements</h3>
              <div className="space-y-2">
                {unit.beds.map((bed, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="text-lg">•</span>
                    <span>{bed.count} {bed.type} {bed.count > 1 ? 'beds' : 'bed'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {unit.amenities && unit.amenities.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Amenities</h2>
              <AmenityList amenities={unit.amenities} />
            </div>
          )}

          {/* Location & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-lg">
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-sm text-gray-600">
                126 Dillard Mill Road<br />
                Davisville, MO 65456
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Walking distance to historic Dillard Mill
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg">
              <h3 className="font-semibold mb-2">Questions?</h3>
              <p className="text-sm text-gray-600 mb-2">
                Contact us for more information
              </p>
              <a
                href="tel:+13148434321"
                className="text-sm text-stone-700 hover:text-stone-900 font-semibold"
              >
                (314) 843-4321
              </a>
            </div>
          </div>

          {/* Other Booking Options */}
          {(unit.airbnbUrl || unit.vrboUrl || unit.bookingUrl) && (
            <div className="p-6 bg-stone-50 rounded-lg">
              <h3 className="font-semibold mb-3">Also Available On</h3>
              <div className="flex flex-wrap gap-3">
                {unit.airbnbUrl && (
                  <a
                    href={unit.airbnbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-stone-800 text-stone-800 px-6 py-2 rounded-lg font-semibold hover:bg-stone-100 transition-colors text-sm"
                  >
                    View on Airbnb
                  </a>
                )}
                {unit.vrboUrl && (
                  <a
                    href={unit.vrboUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-stone-800 text-stone-800 px-6 py-2 rounded-lg font-semibold hover:bg-stone-100 transition-colors text-sm"
                  >
                    View on VRBO
                  </a>
                )}
                {unit.bookingUrl && (
                  <a
                    href={unit.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-stone-800 text-stone-800 px-6 py-2 rounded-lg font-semibold hover:bg-stone-100 transition-colors text-sm"
                  >
                    View on Hipcamp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Inline Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
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
        </div>
      </div>
    </div>
  );
}
