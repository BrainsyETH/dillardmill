'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { bookedNights, canCheckIn, canCheckOut } from '@/lib/booking/calendar';
import { addDays, todayAtProperty } from '@/lib/booking/dates';

/** Local Date ↔ ISO calendar date, without UTC shifting. */
export function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

interface DatePickerProps {
  unitSlug: string;
  minStay: number;
  checkIn?: string;
  checkOut?: string;
  onChange: (checkIn: string | undefined, checkOut: string | undefined) => void;
  /** Bump to force a reload of availability (e.g. after a conflict). */
  refreshKey?: number;
}

export function DatePicker({ unitSlug, minStay, checkIn, checkOut, onChange, refreshKey = 0 }: DatePickerProps) {
  const today = todayAtProperty();
  const requestKey = `${unitSlug}|${today}|${refreshKey}`;
  const [result, setResult] = useState<{ key: string; ranges: { start: string; end: string }[]; error: boolean }>({
    key: '',
    ranges: [],
    error: false,
  });
  const loading = result.key !== requestKey;
  const ranges = result.ranges;
  const loadError = !loading && result.error;

  const wide = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(min-width: 768px)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(min-width: 768px)').matches,
    () => false,
  );
  const months = wide ? 2 : 1;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/booking/booked-dates?unit=${encodeURIComponent(unitSlug)}&from=${today}&to=${addDays(today, 548)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => !cancelled && setResult({ key: requestKey, ranges: data.ranges ?? [], error: false }))
      .catch(() => !cancelled && setResult({ key: requestKey, ranges: [], error: true }));
    return () => {
      cancelled = true;
    };
  }, [unitSlug, today, requestKey]);

  const booked = useMemo(() => bookedNights(ranges), [ranges]);
  const choosingCheckOut = Boolean(checkIn && !checkOut);

  // If availability changed under an existing selection, clear it.
  useEffect(() => {
    if (!loading && checkIn && checkOut && !canCheckOut(checkOut, checkIn, booked, minStay)) {
      onChange(undefined, undefined);
    }
  }, [loading, booked, checkIn, checkOut, minStay, onChange]);

  const isDisabled = (date: Date) => {
    const iso = toIso(date);
    if (choosingCheckOut && checkIn) {
      // Allow re-picking an earlier check-in while choosing check-out.
      return !canCheckOut(iso, checkIn, booked, minStay) && !canCheckIn(iso, booked, minStay, today);
    }
    return !canCheckIn(iso, booked, minStay, today);
  };

  const handleDayClick = (date: Date) => {
    const iso = toIso(date);
    if (choosingCheckOut && checkIn && canCheckOut(iso, checkIn, booked, minStay)) {
      onChange(checkIn, iso);
    } else if (canCheckIn(iso, booked, minStay, today)) {
      onChange(iso, undefined);
    }
  };

  const selected = checkIn ? { from: fromIso(checkIn), to: checkOut ? fromIso(checkOut) : undefined } : undefined;

  return (
    <div>
      <p className="text-sm text-brand-charcoal/70 mb-2" aria-live="polite">
        {loading
          ? 'Loading availability…'
          : loadError
            ? 'Could not load availability — dates will be checked when you continue.'
            : choosingCheckOut
              ? `Now choose your check-out date${minStay > 1 ? ` (minimum ${minStay} nights)` : ''}.`
              : 'Choose your check-in date.'}
      </p>
      <DayPicker
        mode="range"
        selected={selected}
        onDayClick={handleDayClick}
        // Selection is fully controlled through onDayClick.
        onSelect={() => {}}
        disabled={isDisabled}
        numberOfMonths={months}
        startMonth={fromIso(today)}
        endMonth={fromIso(addDays(today, 548))}
        defaultMonth={checkIn ? fromIso(checkIn) : fromIso(today)}
        excludeDisabled={false}
        className="text-sm"
        styles={{ root: { ['--rdp-accent-color' as string]: '#3A2A1E', ['--rdp-accent-background-color' as string]: '#F4F1EB' } }}
      />
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-brand-charcoal/70">
          <span className="inline-block w-4 h-4 rounded bg-gray-200 line-through" /> Unavailable
        </span>
        {(checkIn || checkOut) && (
          <button type="button" onClick={() => onChange(undefined, undefined)} className="underline text-brand-charcoal/80">
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
