'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mapUnits as defaultMarkers, DRONE_PHOTO_URL } from '@/lib/map/map-units';
import type { MapUnit } from '@/lib/map/map-units';

interface PropertyLayoutViewProps {
  variant?: 'embedded' | 'fullscreen';
  markers?: MapUnit[];
}

export default function PropertyLayoutView({
  variant = 'embedded',
  markers = defaultMarkers,
}: PropertyLayoutViewProps) {
  const [selected, setSelected] = useState<MapUnit | null>(null);

  const heightClass = variant === 'fullscreen'
    ? 'h-[calc(100vh-80px)]'
    : 'h-[500px] rounded-2xl';

  return (
    <div
      className={`${heightClass} w-full relative overflow-hidden bg-gradient-to-br from-brand-forest/80 to-brand-forest`}
      onClick={() => setSelected(null)}
    >
      {/* Drone photo background */}
      <img
        src={DRONE_PHOTO_URL}
        alt="Aerial view of Pine Valley at Dillard Mill property"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      {/* Markers overlay */}
      <div className="absolute inset-0">
        {markers.map((unit) => (
          <LayoutMarker
            key={unit.id}
            unit={unit}
            isSelected={selected?.id === unit.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(unit);
            }}
          />
        ))}
      </div>

      {/* Popup */}
      {selected && (
        <LayoutPopup
          unit={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 text-xs pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-brand-copper" />
            <span className="text-brand-charcoal">Rental Units</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-brand-forest" />
            <span className="text-brand-charcoal">Landmarks</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutMarker({
  unit,
  isSelected,
  onClick,
}: {
  unit: MapUnit;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const isLandmark = unit.type === 'landmark';
  const bg = isLandmark ? 'bg-brand-forest' : 'bg-brand-copper';
  const ring = isLandmark ? 'ring-brand-forest/30' : 'ring-brand-copper/30';

  return (
    <button
      type="button"
      className="absolute flex flex-col items-center group cursor-pointer"
      style={{
        left: `${unit.layoutPosition.x}%`,
        top: `${unit.layoutPosition.y}%`,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={onClick}
    >
      <div
        className={`
          ${bg} rounded-full p-2 shadow-lg
          transition-all duration-200
          group-hover:scale-110 group-hover:shadow-xl
          ${isSelected ? `scale-110 ring-4 ${ring}` : ''}
        `}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isLandmark ? (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
          )}
        </svg>
      </div>
      <div
        className={`
          w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent
          ${isLandmark ? 'border-t-brand-forest' : 'border-t-brand-copper'}
          -mt-[1px]
        `}
      />
      <span className={`
        mt-1 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm
        whitespace-nowrap max-w-[120px] truncate
        ${isLandmark ? 'bg-brand-forest/90 text-white' : 'bg-white/90 text-brand-charcoal'}
      `}>
        {unit.name}
      </span>
    </button>
  );
}

function LayoutPopup({ unit, onClose }: { unit: MapUnit; onClose: () => void }) {
  const isLandmark = unit.type === 'landmark';

  // Position the popup above the marker, but keep it on-screen
  const popupStyle: React.CSSProperties = {
    left: `${unit.layoutPosition.x}%`,
    top: `${unit.layoutPosition.y}%`,
    transform: 'translate(-50%, calc(-100% - 56px))',
  };

  return (
    <div
      className="absolute z-20 w-72 max-w-[calc(100vw-2rem)]"
      style={popupStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-brand-charcoal shadow-sm"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isLandmark ? (
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
        ) : (
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2 pr-6">
              <h3 className="font-serif text-lg font-semibold text-brand-forest leading-tight">
                {unit.name}
              </h3>
              {unit.capacity && (
                <span className="flex-shrink-0 text-xs font-medium bg-brand-copper/10 text-brand-copper px-2 py-1 rounded-full">
                  Sleeps {unit.capacity}
                </span>
              )}
            </div>

            {unit.beds && (
              <p className="text-sm text-brand-charcoal/70 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                </svg>
                {unit.beds}
              </p>
            )}

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

            {unit.plumbing && (
              <p className="text-xs text-brand-stone mb-3">
                {unit.plumbing === 'full' ? '✓ Full plumbing' : '✓ Shared barn bathhouse'}
              </p>
            )}

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
        )}
      </div>
    </div>
  );
}
