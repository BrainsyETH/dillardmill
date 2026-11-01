import { describe, expect, it } from 'vitest';
import { bookedNights, canCheckIn, canCheckOut, maxCheckOut } from './calendar';

// Airbnb guest Nov 10 → Nov 13 (nights 10, 11, 12).
const booked = bookedNights([{ start: '2026-11-10', end: '2026-11-13' }]);
const today = '2026-11-01';

describe('guest calendar rules', () => {
  it('blocks booked nights but allows check-in on the departure day', () => {
    expect(canCheckIn('2026-11-10', booked, 1, today)).toBe(false);
    expect(canCheckIn('2026-11-12', booked, 1, today)).toBe(false);
    expect(canCheckIn('2026-11-13', booked, 1, today)).toBe(true);
  });

  it('allows check-out on the next guest’s arrival day, not past it', () => {
    expect(maxCheckOut('2026-11-07', booked)).toBe('2026-11-10');
    expect(canCheckOut('2026-11-10', '2026-11-07', booked, 2)).toBe(true);
    expect(canCheckOut('2026-11-11', '2026-11-07', booked, 2)).toBe(false);
  });

  it('enforces minimum stay on both ends', () => {
    expect(canCheckOut('2026-11-08', '2026-11-07', booked, 2)).toBe(false);
    // Only 1 night free before the Airbnb stay: unusable with a 2-night minimum.
    expect(canCheckIn('2026-11-09', booked, 2, today)).toBe(false);
    expect(canCheckIn('2026-11-09', booked, 1, today)).toBe(true);
  });

  it('rejects past dates', () => {
    expect(canCheckIn('2026-10-31', booked, 1, today)).toBe(false);
  });
});
