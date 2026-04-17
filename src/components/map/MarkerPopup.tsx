'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { MapUnit } from '@/lib/map/map-units';

interface MarkerPopupProps {
  marker: MapUnit;
  onClose: () => void;
  /** Desktop-only: screen coordinates (px) relative to the map container */
  screenPosition?: { x: number; y: number };
  /** Desktop-only: map container dimensions used to clamp popup placement */
  containerBounds?: { width: number; height: number };
}

const EDGE_MARGIN = 12;
const MARKER_OFFSET = 48;

/**
 * Shared popup for map markers.
 * - Mobile (< 640px): full-width bottom sheet
 * - Desktop (>= 640px): floating card positioned near the marker, clamped
 *   within the map container bounds
 */
export default function MarkerPopup({
  marker,
  onClose,
  screenPosition,
  containerBounds,
}: MarkerPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{
    left: number;
    top: number;
    anchor: 'above' | 'below';
  } | null>(null);

  useLayoutEffect(() => {
    if (!screenPosition || !containerBounds || !popupRef.current) {
      setPlacement(null);
      return;
    }
    const popup = popupRef.current;
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const half = popupWidth / 2;

    // Clamp horizontal center so the popup stays inside the container
    const minX = half + EDGE_MARGIN;
    const maxX = Math.max(minX, containerBounds.width - half - EDGE_MARGIN);
    const clampedX = Math.max(minX, Math.min(maxX, screenPosition.x));

    // Prefer above the marker; flip below if there isn't room
    const spaceAbove = screenPosition.y - MARKER_OFFSET;
    const spaceBelow = containerBounds.height - screenPosition.y - MARKER_OFFSET;
    const anchor: 'above' | 'below' =
      spaceAbove >= popupHeight + EDGE_MARGIN || spaceAbove >= spaceBelow
        ? 'above'
        : 'below';

    let top =
      anchor === 'above'
        ? screenPosition.y - MARKER_OFFSET - popupHeight
        : screenPosition.y + MARKER_OFFSET;
    // Final vertical clamp so popup never spills out of the container
    top = Math.max(
      EDGE_MARGIN,
      Math.min(containerBounds.height - popupHeight - EDGE_MARGIN, top)
    );

    setPlacement({ left: clampedX, top, anchor });
  }, [screenPosition, containerBounds, marker]);

  return (
    <>
      {/* Backdrop (mobile only) to close on tap outside */}
      <div
        className="sm:hidden fixed inset-0 bg-black/30 z-30 animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Mobile: bottom sheet */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl max-h-[75vh] overflow-y-auto animate-[slideUp_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="relative">
          <CloseButton onClose={onClose} />
          <PopupContent marker={marker} />
        </div>
      </div>

      {/* Desktop: floating card, clamped within the map container */}
      <div
        className="hidden sm:block absolute z-40 pointer-events-none"
        style={
          screenPosition
            ? placement
              ? {
                  left: `${placement.left}px`,
                  top: `${placement.top}px`,
                  transform: 'translateX(-50%)',
                }
              : {
                  // Hidden first paint so we can measure the popup before
                  // committing to a final position.
                  left: `${screenPosition.x}px`,
                  top: `${screenPosition.y}px`,
                  transform: 'translate(-50%, -100%)',
                  visibility: 'hidden',
                }
            : undefined
        }
      >
        <div
          ref={popupRef}
          className="w-80 max-w-[min(20rem,calc(100%-1.5rem))] bg-white rounded-xl shadow-2xl overflow-hidden relative pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClose={onClose} />
          <PopupContent marker={marker} />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-brand-charcoal shadow-md"
      aria-label="Close"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function PopupContent({ marker }: { marker: MapUnit }) {
  const isLandmark = marker.type === 'landmark';

  return (
    <div>
      {/* Image */}
      {marker.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={marker.image}
          alt={marker.name}
          className="w-full h-40 sm:h-36 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="h-40 sm:h-36 bg-gradient-to-br from-brand-sand/60 to-brand-sage/30 flex items-center justify-center">
          <svg className="w-12 h-12 text-brand-stone/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

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
              {marker.name}
            </h3>
          </div>
          <p className="text-sm text-brand-charcoal/80">{marker.description}</p>

          {marker.detailUrl && (
            <Link
              href={marker.detailUrl}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-copper hover:text-brand-copper-dark transition-colors"
            >
              Learn more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>
      ) : (
        <div className="p-4">
          {/* Name + capacity */}
          <div className="flex items-start justify-between gap-2 mb-2 pr-8">
            <h3 className="font-serif text-lg font-semibold text-brand-forest leading-tight">
              {marker.name}
            </h3>
            {marker.capacity && (
              <span className="flex-shrink-0 text-xs font-medium bg-brand-copper/10 text-brand-copper px-2 py-1 rounded-full">
                Sleeps {marker.capacity}
              </span>
            )}
          </div>

          {marker.beds && (
            <p className="text-sm text-brand-charcoal/70 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
              </svg>
              {marker.beds}
            </p>
          )}

          {marker.description && (
            <p className="text-sm text-brand-charcoal/70 mb-3">{marker.description}</p>
          )}

          {marker.amenities && marker.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 items-center">
              {marker.amenities.slice(0, 5).map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs bg-brand-sage/10 text-brand-forest px-2 py-0.5 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {marker.amenities.length > 5 && (
                marker.detailUrl ? (
                  <Link
                    href={marker.detailUrl}
                    className="text-xs font-semibold text-brand-copper hover:text-brand-copper-dark underline underline-offset-2"
                  >
                    +{marker.amenities.length - 5} more
                  </Link>
                ) : (
                  <span className="text-xs text-brand-stone">
                    +{marker.amenities.length - 5} more
                  </span>
                )
              )}
            </div>
          )}

          {marker.plumbing && (
            <p className="text-xs text-brand-stone mb-3">
              {marker.plumbing === 'full' ? '✓ Full plumbing' : '✓ Shared barn bathhouse'}
            </p>
          )}

          {/* Action buttons — lead with direct booking (unit detail page),
              keep external platforms as a secondary link. */}
          <div className="flex flex-col gap-2">
            {marker.detailUrl ? (
              <Link
                href={marker.detailUrl}
                className="text-center text-sm font-semibold py-2.5 px-3 rounded-lg bg-brand-copper text-white hover:bg-brand-copper-dark transition-colors"
              >
                Book Direct
              </Link>
            ) : marker.bookingUrl ? (
              <a
                href={marker.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-sm font-semibold py-2.5 px-3 rounded-lg bg-brand-copper text-white hover:bg-brand-copper-dark transition-colors"
              >
                Book Now
              </a>
            ) : null}

            {marker.detailUrl && marker.bookingUrl && (
              <a
                href={marker.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-xs font-medium text-brand-stone hover:text-brand-charcoal transition-colors"
              >
                Or view on Airbnb
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
