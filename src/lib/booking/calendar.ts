// Selection rules for the guest calendar. Ranges are [start, end) — the end
// is a check-out day, so a new stay may check in on another stay's check-out
// day and check out on another stay's check-in day.

import { addDays, eachNight } from './dates';
import { MAX_NIGHTS } from './pricing';

export interface DateRange {
  start: string;
  end: string;
}

export function bookedNights(ranges: DateRange[]): Set<string> {
  const nights = new Set<string>();
  for (const r of ranges) for (const n of eachNight(r.start, r.end)) nights.add(n);
  return nights;
}

/** Latest possible check-out for a stay starting on checkIn. */
export function maxCheckOut(checkIn: string, booked: Set<string>): string {
  const limit = addDays(checkIn, MAX_NIGHTS);
  for (let d = checkIn; d < limit; d = addDays(d, 1)) {
    if (booked.has(d)) return d;
  }
  return limit;
}

export function canCheckIn(date: string, booked: Set<string>, minStay: number, today: string): boolean {
  if (date < today || booked.has(date)) return false;
  return maxCheckOut(date, booked) >= addDays(date, Math.max(1, minStay));
}

export function canCheckOut(date: string, checkIn: string, booked: Set<string>, minStay: number): boolean {
  return date >= addDays(checkIn, Math.max(1, minStay)) && date <= maxCheckOut(checkIn, booked);
}
