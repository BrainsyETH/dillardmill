'use client';

import Link from 'next/link';
import { Popup } from 'react-map-gl/mapbox';
import type { MapUnit } from '@/lib/map/map-units';

interface UnitPopupProps {
  unit: MapUnit;
  onClose: () => void;
}

export default function UnitPopup({ unit, onClose }: UnitPopupProps) {
  const isLandmark = unit.type === 'landmark';

  return (
    <Popup
      longitude={unit.coordinates.lng}
      latitude={unit.coordinates.lat}
      anchor="bottom"
      offset={40}
      closeOnClick={false}
      onClose={onClose}
      maxWidth="320px"
      className="property-map-popup"
    >
      <div className="p-0">
        {isLandmark ? (
          <LandmarkContent unit={unit} />
        ) : (
          <UnitContent unit={unit} />
        )}
      </div>
    </Popup>
  );
}

function LandmarkContent({ unit }: { unit: MapUnit }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-brand-forest/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-brand-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="font-serif text-lg font-semibold text-brand-forest">
          {unit.name}
        </h3>
      </div>
      <p className="text-sm text-brand-charcoal/80">{unit.description}</p>
    </div>
  );
}

function UnitContent({ unit }: { unit: MapUnit }) {
  return (
    <div>
      {/* Image */}
      {unit.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={unit.image}
          alt={unit.name}
          className="w-full h-32 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-br from-brand-sand/60 to-brand-sage/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-brand-stone/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="p-4">
        {/* Name and capacity */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-lg font-semibold text-brand-forest leading-tight">
            {unit.name}
          </h3>
          {unit.capacity && (
            <span className="flex-shrink-0 text-xs font-medium bg-brand-copper/10 text-brand-copper px-2 py-1 rounded-full">
              Sleeps {unit.capacity}
            </span>
          )}
        </div>

        {/* Beds */}
        {unit.beds && (
          <p className="text-sm text-brand-charcoal/70 mb-2 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            {unit.beds}
          </p>
        )}

        {/* Amenities */}
        {unit.amenities && unit.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {unit.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="text-xs bg-brand-sage/10 text-brand-forest px-2 py-0.5 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {unit.amenities.length > 4 && (
              <span className="text-xs text-brand-stone">
                +{unit.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Plumbing indicator */}
        {unit.plumbing && (
          <p className="text-xs text-brand-stone mb-3 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {unit.plumbing === 'full' ? 'Full plumbing' : 'Shared barn bathhouse'}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {unit.detailUrl && (
            <Link
              href={unit.detailUrl}
              className="flex-1 text-center text-sm font-medium py-2 px-3 rounded-lg border border-brand-forest text-brand-forest hover:bg-brand-forest/5 transition-colors"
            >
              View Details
            </Link>
          )}
          {unit.bookingUrl && (
            <a
              href={unit.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-medium py-2 px-3 rounded-lg bg-brand-copper text-white hover:bg-brand-copper-dark transition-colors"
            >
              Book Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
