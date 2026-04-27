'use client';

import { useEffect, useRef } from 'react';
import { BookingForm } from './BookingForm';

interface EmbedBookingClientProps {
  unit: {
    _id: string;
    name: string;
    slug: { current: string };
    basePrice: number;
    cleaningFee: number;
    baseGuests?: number;
    extraGuestFee?: number;
    petsAllowed?: boolean;
    maxPets?: number;
    petFee?: number;
    minStay?: number;
    maxGuests: number;
  };
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export function EmbedBookingClient({
  unit,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: EmbedBookingClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Notify the parent window of our height whenever the form grows or
  // shrinks (step changes, validation errors, summary expansion, mobile
  // keyboard pushing the Square card iframe). The Squarespace embed
  // listens for these and resizes the iframe accordingly.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const post = (height: number) => {
      try {
        window.parent.postMessage(
          { source: 'dillardmill-booking', type: 'resize', height },
          '*'
        );
      } catch {
        // best-effort — cross-origin posts can throw in some browsers
      }
    };

    post(el.scrollHeight);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.ceil(entry.contentRect.height);
        post(height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleComplete = (confirmationCode: string) => {
    // Hand control back to the parent so it can break out of the iframe
    // and load the full-page confirmation. Parent should listen for this
    // message and run window.top.location = `/booking/confirmation/${code}`.
    try {
      window.parent.postMessage(
        {
          source: 'dillardmill-booking',
          type: 'booking-complete',
          confirmationCode,
          redirectPath: `/booking/confirmation/${confirmationCode}`,
        },
        '*'
      );
    } catch {
      // best-effort
    }
  };

  return (
    <div ref={containerRef} className="w-full px-4 py-6 sm:px-6 sm:py-8">
      <BookingForm
        unit={unit}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        initialGuests={initialGuests}
        onComplete={handleComplete}
      />
    </div>
  );
}
