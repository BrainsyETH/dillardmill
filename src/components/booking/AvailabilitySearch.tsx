'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

interface AvailabilitySearchProps {
  /** Minimum guest count allowed in the selector. */
  minGuests?: number;
  /** Maximum guest count in the selector (caps the dropdown). */
  maxGuests?: number;
  /** Called after the URL is updated (optional analytics hook). */
  onSubmit?: (params: { checkIn: string; checkOut: string; guests: number }) => void;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayIso(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
}

function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
}

export default function AvailabilitySearch({
  minGuests = 1,
  maxGuests = 20,
  onSubmit,
}: AvailabilitySearchProps) {
  const router = useRouter();
  const params = useSearchParams();

  const initialCheckIn = params.get('checkIn') ?? '';
  const initialCheckOut = params.get('checkOut') ?? '';
  const initialGuests = Number.parseInt(params.get('guests') ?? '', 10);

  const [checkIn, setCheckIn] = useState(
    ISO_DATE_RE.test(initialCheckIn) ? initialCheckIn : ''
  );
  const [checkOut, setCheckOut] = useState(
    ISO_DATE_RE.test(initialCheckOut) ? initialCheckOut : ''
  );
  const [guests, setGuests] = useState(
    Number.isFinite(initialGuests) && initialGuests > 0 ? initialGuests : minGuests
  );

  const minCheckIn = useMemo(() => todayIso(), []);
  const minCheckOut = useMemo(
    () => (checkIn ? addDaysIso(checkIn, 1) : addDaysIso(minCheckIn, 1)),
    [checkIn, minCheckIn]
  );
  const hasDates = !!checkIn && !!checkOut && checkOut > checkIn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasDates) return;
    const next = new URLSearchParams(params.toString());
    next.set('checkIn', checkIn);
    next.set('checkOut', checkOut);
    next.set('guests', String(guests));
    router.replace(`?${next.toString()}`, { scroll: false });
    onSubmit?.({ checkIn, checkOut, guests });
  };

  const handleClear = () => {
    setCheckIn('');
    setCheckOut('');
    setGuests(minGuests);
    const next = new URLSearchParams(params.toString());
    next.delete('checkIn');
    next.delete('checkOut');
    next.delete('guests');
    const query = next.toString();
    router.replace(query ? `?${query}` : '?', { scroll: false });
  };

  const showClear = !!(params.get('checkIn') || params.get('checkOut') || params.get('guests'));

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg border border-brand-sand p-4 sm:p-5"
      aria-label="Find available dates"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] gap-3 sm:gap-4 items-end">
        <label className="block">
          <span className="block text-xs font-semibold text-brand-forest uppercase tracking-wide mb-1.5">
            Check in
          </span>
          <input
            type="date"
            value={checkIn}
            min={minCheckIn}
            onChange={(e) => {
              const next = e.target.value;
              setCheckIn(next);
              // If check-out is now before or equal to check-in, clear it.
              if (checkOut && next && checkOut <= next) setCheckOut('');
            }}
            className="w-full px-3 py-2.5 border border-brand-sand rounded-lg bg-brand-cream/50 focus:bg-white focus:border-brand-copper focus:outline-none transition-colors text-brand-charcoal"
            required
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-brand-forest uppercase tracking-wide mb-1.5">
            Check out
          </span>
          <input
            type="date"
            value={checkOut}
            min={minCheckOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-3 py-2.5 border border-brand-sand rounded-lg bg-brand-cream/50 focus:bg-white focus:border-brand-copper focus:outline-none transition-colors text-brand-charcoal"
            required
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-brand-forest uppercase tracking-wide mb-1.5">
            Guests
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number.parseInt(e.target.value, 10))}
            className="w-full px-3 py-2.5 border border-brand-sand rounded-lg bg-brand-cream/50 focus:bg-white focus:border-brand-copper focus:outline-none transition-colors text-brand-charcoal"
          >
            {Array.from({ length: Math.max(1, maxGuests - minGuests + 1) }, (_, i) => minGuests + i).map(
              (n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'guest' : 'guests'}
                </option>
              )
            )}
          </select>
        </label>

        <button
          type="submit"
          disabled={!hasDates}
          className="btn btn-primary w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Find Stays
        </button>
      </div>

      {showClear && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-brand-stone">
            Dates will be carried through to each unit so you can book directly.
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-brand-copper hover:text-brand-copper-dark font-semibold"
          >
            Clear
          </button>
        </div>
      )}
    </form>
  );
}
