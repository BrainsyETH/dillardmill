'use client';

import { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { mapUnits as defaultMarkers, DRONE_PHOTO_URL } from '@/lib/map/map-units';
import type { MapUnit } from '@/lib/map/map-units';
import MarkerPopup from './MarkerPopup';
import MarkerFilter, { type MarkerFilterValue } from './MarkerFilter';

interface PropertyLayoutViewProps {
  variant?: 'embedded' | 'fullscreen';
  /** Rendered inside a cross-origin iframe — make POI links absolute and target the top frame. */
  embed?: boolean;
}

export default function PropertyLayoutView({
  variant = 'embedded',
  embed = false,
}: PropertyLayoutViewProps) {
  // Start empty so the published marker set from the API is the first thing
  // painted — avoids the brief flash of draft/hardcoded markers.
  const [markers, setMarkers] = useState<MapUnit[]>([]);
  const [selected, setSelected] = useState<MapUnit | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popupScreenPos, setPopupScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [containerBounds, setContainerBounds] = useState<{ width: number; height: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(3 / 2);
  const [filter, setFilter] = useState<MarkerFilterValue>('all');
  const [scale, setScale] = useState<number>(1);

  // Below this zoom, hide marker labels to avoid overlap at base zoom —
  // clustered units (Tiny Cabins, Argosy, Sherman) sit very close together
  // in the drone photo. Selected / hovered markers always show their label.
  const LABEL_SCALE_THRESHOLD = 1.4;
  const labelsVisible = scale >= LABEL_SCALE_THRESHOLD;

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/map-markers')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.markers) && data.markers.length > 0) {
          setMarkers(data.markers);
        } else {
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

  // When embedded in a cross-origin iframe, notify the parent window so it
  // can grow the iframe to fit the popup on narrow viewports.
  useEffect(() => {
    if (!embed) return;
    try {
      window.parent.postMessage(
        { source: 'dillardmill-map', popupOpen: !!selected },
        '*'
      );
    } catch {
      // parent postMessage is best-effort; ignore failures
    }
  }, [embed, selected]);

  const layoutMarkers = markers.filter((m) => m.showOnLayout !== false);
  const unitCount = layoutMarkers.filter((m) => m.type === 'unit').length;
  const landmarkCount = layoutMarkers.filter((m) => m.type === 'landmark').length;
  const visibleMarkers = layoutMarkers.filter((m) => {
    if (filter === 'units') return m.type === 'unit';
    if (filter === 'landmarks') return m.type === 'landmark';
    return true;
  });

  const handleFilterChange = (next: MarkerFilterValue) => {
    setFilter(next);
    setSelected((current) => {
      if (!current) return null;
      if (next === 'units' && current.type !== 'unit') return null;
      if (next === 'landmarks' && current.type !== 'landmark') return null;
      return current;
    });
  };

  const heightClass = embed
    ? 'h-dvh'
    : variant === 'fullscreen'
      ? 'h-[calc(100dvh-160px)] min-h-[400px]'
      : 'h-[400px] sm:h-[500px] rounded-2xl';

  const handleMarkerClick = (unit: MapUnit, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Compute the marker's current screen position for desktop popup placement
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setPopupScreenPos({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top,
      });
    }
    setSelected(unit);
  };

  return (
    <div
      ref={containerRef}
      className={`${heightClass} w-full relative overflow-hidden ${
        embed
          ? 'bg-transparent'
          : 'bg-gradient-to-br from-brand-forest/80 to-brand-forest'
      }`}
    >
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={4}
        centerOnInit
        limitToBounds={true}
        doubleClick={{ mode: 'toggle', step: 0.7 }}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        panning={{ velocityDisabled: true }}
        onTransform={(_ref, state) => setScale(state.scale)}
      >
        {({ resetTransform }) => (
          <>
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full"
            >
              {/* Flex wrapper to center the aspect-ratio container */}
              <div
                className={`w-full h-full flex items-center justify-center ${
                  embed ? 'p-0' : 'p-2'
                }`}
              >
                {/* Aspect-ratio container matching the drone photo */}
                <div
                  className="relative"
                  style={{
                    aspectRatio: `${aspectRatio}`,
                    width: `min(100%, calc((100% - 0px) * ${aspectRatio}))`,
                    height: `min(100%, calc((100% - 0px) / ${aspectRatio}))`,
                  }}
                >
                  {/* Drone photo — fills the aspect-ratio container exactly */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={DRONE_PHOTO_URL}
                    alt="Aerial view of Pine Valley at Dillard Mill property"
                    className="absolute inset-0 w-full h-full block select-none pointer-events-none"
                    draggable={false}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      if (img.naturalWidth && img.naturalHeight) {
                        setAspectRatio(img.naturalWidth / img.naturalHeight);
                      }
                    }}
                  />

                  {/* Markers — percentages are relative to the image */}
                  {visibleMarkers.map((unit) => (
                    <LayoutMarker
                      key={unit.id}
                      unit={unit}
                      isSelected={selected?.id === unit.id}
                      showLabel={labelsVisible}
                      onClick={(e) => handleMarkerClick(unit, e)}
                    />
                  ))}
                </div>
              </div>
            </TransformComponent>

            {/* Reset/Fit button */}
            <FitButton onReset={() => { resetTransform(); setSelected(null); }} />
          </>
        )}
      </TransformWrapper>

      {/* Popup — rendered outside TransformWrapper so it doesn't zoom */}
      {selected && (
        <MarkerPopup
          marker={selected}
          onClose={() => setSelected(null)}
          screenPosition={popupScreenPos ?? undefined}
          containerBounds={containerBounds ?? undefined}
          embed={embed}
        />
      )}

      {/* Filter chips */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
        <MarkerFilter
          value={filter}
          onChange={handleFilterChange}
          counts={{ units: unitCount, landmarks: landmarkCount }}
        />
      </div>

      {/* Gesture hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none">
        <span className="sm:hidden">Pinch to zoom · Drag to pan</span>
        <span className="hidden sm:inline">Scroll to zoom · Drag to pan</span>
      </div>
    </div>
  );
}

function FitButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="absolute top-4 right-4 z-10 bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-xs font-medium text-brand-charcoal flex items-center gap-1.5"
      aria-label="Reset view"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
      <span className="hidden sm:inline">Fit</span>
    </button>
  );
}

function LayoutMarker({
  unit,
  isSelected,
  showLabel,
  onClick,
}: {
  unit: MapUnit;
  isSelected: boolean;
  /** When false, hide the label at rest — hover or selection still reveals it. */
  showLabel: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const isLandmark = unit.type === 'landmark';
  const bg = isLandmark ? 'bg-brand-forest' : 'bg-brand-copper';
  const ring = isLandmark ? 'ring-brand-forest/30' : 'ring-brand-copper/30';

  // Always visible when the marker is selected or the user hovers/focuses it.
  // Otherwise follow the zoom-level decision from the parent.
  const labelAtRestVisible = showLabel || isSelected;

  return (
    <button
      type="button"
      aria-label={unit.name}
      className="absolute flex flex-col items-center group"
      style={{
        left: `${unit.layoutPosition.x}%`,
        top: `${unit.layoutPosition.y}%`,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={onClick}
    >
      <div
        className={`
          ${bg} rounded-full p-1.5 shadow-lg
          transition-all duration-200
          group-hover:scale-110 group-hover:shadow-xl
          ${isSelected ? `scale-110 ring-4 ${ring}` : ''}
        `}
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent
          ${isLandmark ? 'border-t-brand-forest' : 'border-t-brand-copper'}
          -mt-[1px]
        `}
      />
      <span className={`
        mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-sm
        whitespace-nowrap max-w-[100px] truncate
        transition-opacity duration-150
        ${labelAtRestVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100'}
        ${isLandmark ? 'bg-brand-forest/90 text-white' : 'bg-white/90 text-brand-charcoal'}
      `}>
        {unit.name}
      </span>
    </button>
  );
}
