'use client';

import { useState, useCallback } from 'react';
import Map, { NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapUnits, PROPERTY_CENTER, DEFAULT_ZOOM, DRONE_OVERLAY } from '@/lib/map/map-units';
import type { MapUnit } from '@/lib/map/map-units';
import UnitMarker from './UnitMarker';
import UnitPopup from './UnitPopup';

interface PropertyMapProps {
  variant?: 'embedded' | 'fullscreen';
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function PropertyMap({ variant = 'embedded' }: PropertyMapProps) {
  const [selectedUnit, setSelectedUnit] = useState<MapUnit | null>(null);

  const handleMarkerClick = useCallback((unit: MapUnit) => {
    setSelectedUnit(unit);
  }, []);

  const handlePopupClose = useCallback(() => {
    setSelectedUnit(null);
  }, []);

  if (!MAPBOX_TOKEN) {
    return <MapFallback variant={variant} />;
  }

  const heightClass = variant === 'fullscreen'
    ? 'h-[calc(100vh-80px)]'
    : 'h-[500px] rounded-2xl';

  return (
    <div className={`${heightClass} w-full overflow-hidden relative`}>
      <Map
        initialViewState={{
          longitude: PROPERTY_CENTER.lng,
          latitude: PROPERTY_CENTER.lat,
          zoom: DEFAULT_ZOOM,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={() => setSelectedUnit(null)}
      >
        <NavigationControl position="top-right" />

        {/* Drone photo overlay */}
        <Source
          id="drone-overlay"
          type="image"
          url={DRONE_OVERLAY.url}
          coordinates={DRONE_OVERLAY.coordinates}
        >
          <Layer
            id="drone-overlay-layer"
            type="raster"
            paint={{ 'raster-opacity': 1 }}
          />
        </Source>

        {mapUnits.map((unit) => (
          <UnitMarker
            key={unit.id}
            unit={unit}
            isSelected={selectedUnit?.id === unit.id}
            onClick={handleMarkerClick}
          />
        ))}

        {selectedUnit && (
          <UnitPopup unit={selectedUnit} onClose={handlePopupClose} />
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 text-xs">
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

function MapFallback({ variant }: { variant: string }) {
  const heightClass = variant === 'fullscreen'
    ? 'h-[calc(100vh-80px)]'
    : 'h-[500px] rounded-2xl';

  return (
    <div className={`${heightClass} w-full bg-gradient-to-br from-brand-sand/50 to-brand-sage/10 flex items-center justify-center border border-brand-sand`}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-brand-copper/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-brand-charcoal font-medium mb-2">126 Dillard Mill Road</p>
        <p className="text-brand-stone">Davisville, MO 65456</p>
        <a
          href="https://maps.google.com/?q=126+Dillard+Mill+Road+Davisville+MO+65456"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-brand-copper hover:text-brand-copper-dark font-medium transition-colors"
        >
          Open in Google Maps
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
