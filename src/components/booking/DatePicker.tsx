'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { addDays, parseISO } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  unitId: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  onCheckInChange: (date: Date | undefined) => void;
  onCheckOutChange: (date: Date | undefined) => void;
}

export function DatePicker({
  unitId,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: DatePickerProps) {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch booked dates
  useEffect(() => {
    async function fetchBookedDates() {
      setLoading(true);
      try {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = addDays(new Date(), 365).toISOString().split('T')[0];

        const response = await fetch(
          `/api/booking/booked-dates?unitId=${unitId}&startDate=${startDate}&endDate=${endDate}`
        );
        const data = await response.json();

        // Convert booked ranges to array of dates
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

        setBookedDates(dates);
      } catch (error) {
        console.error('Error fetching booked dates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookedDates();
  }, [unitId]);

  const handleDayClick = (day: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      onCheckInChange(day);
      onCheckOutChange(undefined);
    } else {
      // Set checkout date
      if (day > checkIn) {
        onCheckOutChange(day);
      } else {
        // If selected date is before check-in, reset
        onCheckInChange(day);
        onCheckOutChange(undefined);
      }
    }
  };

  return (
    <div>
      {loading && (
        <div className="text-center py-4 text-gray-500">Loading availability...</div>
      )}

      <DayPicker
        mode="single"
        selected={checkIn}
        onSelect={(date) => date && handleDayClick(date)}
        disabled={[
          ...bookedDates,
          { before: new Date() }, // Disable past dates
        ]}
        modifiers={{
          checkIn: checkIn ? [checkIn] : [],
          checkOut: checkOut ? [checkOut] : [],
          range: checkIn && checkOut
            ? { from: checkIn, to: checkOut }
            : undefined,
        }}
        modifiersClassNames={{
          checkIn: 'bg-stone-800 text-white rounded-l-lg',
          checkOut: 'bg-stone-800 text-white rounded-r-lg',
          range: 'bg-stone-100',
        }}
        className="border border-gray-200 rounded-lg p-4"
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Check-in</div>
          <div className="font-semibold">
            {checkIn ? checkIn.toLocaleDateString() : 'Select date'}
          </div>
        </div>
        <div className="p-3 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Check-out</div>
          <div className="font-semibold">
            {checkOut ? checkOut.toLocaleDateString() : 'Select date'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-stone-800 rounded" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
