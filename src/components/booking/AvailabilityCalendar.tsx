'use client';

import { useEffect, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { addDays, parseISO } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface AvailabilityCalendarProps {
  unitId: string;
  numberOfMonths?: number;
}

export function AvailabilityCalendar({
  unitId,
  numberOfMonths = 2,
}: AvailabilityCalendarProps) {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookedDates() {
      try {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = addDays(new Date(), 365).toISOString().split('T')[0];

        const response = await fetch(
          `/api/booking/booked-dates?unitId=${encodeURIComponent(unitId)}&startDate=${startDate}&endDate=${endDate}`
        );
        if (!response.ok) throw new Error('Failed to load availability');
        const data = await response.json();

        const dates: Date[] = [];
        data.bookedRanges?.forEach((range: { check_in: string; check_out: string }) => {
          const start = parseISO(range.check_in);
          const end = parseISO(range.check_out);
          let current = start;
          while (current <= end) {
            dates.push(new Date(current));
            current = addDays(current, 1);
          }
        });

        if (!cancelled) setBookedDates(dates);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookedDates();
    return () => {
      cancelled = true;
    };
  }, [unitId]);

  const today = useMemo(() => new Date(), []);

  return (
    <div className="w-full">
      {loading && (
        <div className="text-center py-4 text-gray-500 text-sm">Loading availability...</div>
      )}
      {error && (
        <div className="text-center py-4 text-red-600 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <DayPicker
          mode="default"
          numberOfMonths={numberOfMonths}
          disabled={[...bookedDates, { before: today }]}
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{
            booked: 'line-through text-gray-400 bg-gray-100',
          }}
          className="border border-gray-200 rounded-lg p-4"
        />
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
          <span className="text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded" />
          <span className="text-gray-700">Booked</span>
        </div>
      </div>
    </div>
  );
}
