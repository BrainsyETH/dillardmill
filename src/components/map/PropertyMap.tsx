'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapUnits as defaultMarkers, PROPERTY_CENTER, DEFAULT_ZOOM } from '@/lib/map/map-units';
import type { MapUnit } from '@/lib/map/map-units';
import UnitMarker from './UnitMarker';
import MarkerPopup from './MarkerPopup';
import MarkerFilter, { type MarkerFilterValue } from './MarkerFilter';

const DIRECTIONS_URL =
  'https://maps.google.com/?q=126+Dillard+Mill+Road+Davisville+MO+65456';

interface PropertyMapProps {
  variant?: 'embedded' | 'fullscreen';
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function PropertyMap({ variant = 'embedded' }: PropertyMapProps) {
  // Start empty so the published marker set from the API is the first thing
  // painted — avoids the brief flash of draft/hardcoded markers.
  const [markers, setMarkers] = useState<MapUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<MapUnit | null>(null);
  const [popupScreenPos, setPopupScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [containerBounds, setContainerBounds] = useState<{ width: number; height: number } | null>(null);
  const [filter, setFilter] = useState<MarkerFilterValue>('all');
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/map-markers')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.markers) && data.markers.length > 0) {
          setMarkers(data.markers);
        } else {
          // No saved markers — fall back to bundled defaults
          setMarkers(defaultMarkers);
        }
      })
      .catch(() => {
        if (!cancelled) setMarkers(defaultMarkers);
      });
    return () => { cancelled = true; };
  }, []);

  // Track container size for popup clamping
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setContainerBounds({ width: el.clientWidth, height: el.clientHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const locationMarkers = markers.filter((m) => m.showOnLocation !== false);
  const unitCount = locationMarkers.filter((m) => m.type === 'unit').length;
  const landmarkCount = locationMarkers.filter((m) => m.type === 'landmark').length;
  const visibleMarkers = locationMarkers.filter((m) => {
    if (filter === 'units') return m.type === 'unit';
    if (filter === 'landmarks') return m.type === 'landmark';
    return true;
  });

  const updateScreenPos = useCallback((unit: MapUnit) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const point = map.project([unit.coordinates.lng, unit.coordinates.lat]);
    setPopupScreenPos({ x: point.x, y: point.y });
  }, []);

  const handleMarkerClick = useCallback((unit: MapUnit) => {
    setSelectedUnit(unit);
    updateScreenPos(unit);
  }, [updateScreenPos]);

  const handlePopupClose = useCallback(() => {
    setSelectedUnit(null);
  }, []);

  // Keep popup aligned with the marker as the map moves (desktop)
  useEffect(() => {
    if (!selectedUnit) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    const handler = () => updateScreenPos(selectedUnit);
    map.on('move', handler);
    return () => { map.off('move', handler); };
  }, [selectedUnit, updateScreenPos]);

  const handleFilterChange = useCallback(
    (next: MarkerFilterValue) => {
      setFilter(next);
      setSelectedUnit((current) => {
        if (!current) return null;
        if (next === 'units' && current.type !== 'unit') return null;
        if (next === 'landmarks' && current.type !== 'landmark') return null;
        return current;
      });
    },
    []
  );

  if (!MAPBOX_TOKEN) {
    return <MapFallback variant={variant} />;
  }

  const heightClass = variant === 'fullscreen'
    ? 'h-[calc(100dvh-160px)] min-h-[400px]'
    : 'h-[400px] sm:h-[500px] rounded-2xl';

  return (
    <div ref={containerRef} className={`${heightClass} w-full overflow-hidden relative`}>
      <Map
        ref={mapRef}
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

        {visibleMarkers.map((unit) => (
          <UnitMarker
            key={unit.id}
            unit={unit}
            isSelected={selectedUnit?.id === unit.id}
            onClick={handleMarkerClick}
          />
        ))}
      </Map>

      {selectedUnit && (
        <MarkerPopup
          marker={selectedUnit}
          onClose={handlePopupClose}
          screenPosition={popupScreenPos ?? undefined}
          containerBounds={containerBounds ?? undefined}
        />
      )}

      {/* Filter chips */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
        <MarkerFilter
          value={filter}
          onChange={handleFilterChange}
          counts={{ units: unitCount, landmarks: landmarkCount }}
        />
      </div>

      {/* Get directions */}
      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-white/95 hover:bg-white backdrop-blur-sm rounded-full shadow-lg px-4 py-2 text-sm font-semibold text-brand-forest transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m-6 3l6-3" />
        </svg>
        Get Directions
      </a>
    </div>
  );
}

function MapFallback({ variant }: { variant: string }) {
  const heightClass = variant === 'fullscreen'
    ? 'h-[calc(100dvh-160px)] min-h-[400px]'
    : 'h-[400px] sm:h-[500px] rounded-2xl';

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
