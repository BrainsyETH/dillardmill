'use client';

import { Marker } from 'react-map-gl/mapbox';
import type { MapUnit } from '@/lib/map/map-units';

interface UnitMarkerProps {
  unit: MapUnit;
  isSelected: boolean;
  onClick: (unit: MapUnit) => void;
}

function getMarkerIcon(unit: MapUnit) {
  if (unit.type === 'landmark') {
    switch (unit.id) {
      case 'hippy-showers':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        );
      case 'barn':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
        );
      case 'huzzah-creek-access':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        );
    }
  }

  switch (unit.unitType) {
    case 'airstream':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      );
    case 'cafe':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      );
    case 'tiny-cabin':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
      );
    default:
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
      );
  }
}

export default function UnitMarker({ unit, isSelected, onClick }: UnitMarkerProps) {
  const isLandmark = unit.type === 'landmark';
  const bgColor = isLandmark ? 'bg-brand-forest' : 'bg-brand-copper';
  const ringColor = isLandmark ? 'ring-brand-forest/30' : 'ring-brand-copper/30';

  return (
    <Marker
      longitude={unit.coordinates.lng}
      latitude={unit.coordinates.lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(unit);
      }}
    >
      <div className="group cursor-pointer flex flex-col items-center">
        <div
          className={`
            ${bgColor} rounded-full p-2 shadow-lg
            transition-all duration-200
            group-hover:scale-110 group-hover:shadow-xl
            ${isSelected ? `scale-110 ring-4 ${ringColor}` : ''}
          `}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {getMarkerIcon(unit)}
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
      </div>
    </Marker>
  );
}
