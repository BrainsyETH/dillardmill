// End-to-end booking lifecycle against real Postgres (PGlite) with Square,
// email, Sanity, and the Airbnb iCal feed mocked.

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createTestDb } from '@/test/pglite-sql';
import { addDays, todayAtProperty } from './dates';

const state = vi.hoisted(() => ({
  sql: null as unknown,
  airbnbFeed: '',
  airbnbStatus: 200,
}));

vi.mock('@/lib/db/client', () => ({
  get sql() {
    return state.sql;
  },
}));

vi.mock('@/lib/booking/units', () => {
  const unit = {
    _id: 'unit-cottage',
    name: 'Cozy Cottage',
    slug: 'cozy-cottage',
    available: true,
    directBookingEnabled: true,
    basePrice: 150,
    cleaningFee: 75,
    baseGuests: 2,
    extraGuestFee: 20,
    petsAllowed: true,
    maxPets: 2,
    petFee: 50,
    minStay: 2,
    maxGuests: 4,
    seasonalPricing: [],
    icalUrls: { airbnb: 'https://www.airbnb.com/calendar/ical/123.ics' },
  };
  return {
    CALENDAR_SOURCES: ['airbnb', 'hipcamp', 'vrbo'],
    getBookableUnit: vi.fn(async (slug: string) => (slug === unit.slug ? unit : null)),
    getAllBookableUnits: vi.fn(async () => [unit]),
    getBookingSettings: vi.fn(async () => ({
      taxRates: [{ name: 'Lodging tax', ratePercent: 5 }],
      cancellationPolicy: 'Full refund up to 14 days before arrival.',
      houseRules: 'No parties.',
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      requestResponseHours: 24,
      email: null,
      phone: null,
    })),
  };
});

const square = vi.hoisted(() => ({
  authorizeCard: vi.fn(async (..._args: unknown[]) => 'sq-payment-1'),
  capturePayment: vi.fn(async (..._args: unknown[]) => {}),
  voidPayment: vi.fn(async (..._args: unknown[]) => {}),
  refundPayment: vi.fn(async (..._args: unknown[]) => 'sq-refund-1'),
}));
vi.mock('@/lib/square/payments', () => square);

const email = vi.hoisted(() => ({
  sendRequestReceived: vi.fn(async () => true),
  sendOwnerNewRequest: vi.fn(async () => true),
  sendBookingConfirmed: vi.fn(async () => true),
  sendRequestDeclined: vi.fn(async () => true),
  sendBookingCancelled: vi.fn(async () => true),
}));
vi.mock('@/lib/email/resend', () => email);

const service = await import('./service');
const { getUnavailableRanges } = await import('@/lib/db/availability');

const today = todayAtProperty();
const d = (n: number) => addDays(today, n);
const compact = (iso: string) => iso.replace(/-/g, '');

function airbnbFeed(stays: [string, string][]) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    ...stays.flatMap(([a, b], i) => [
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${compact(a)}`,
      `DTEND;VALUE=DATE:${compact(b)}`,
      `UID:airbnb-${i}@airbnb.com`,
      'SUMMARY:Reserved',
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ].join('\r\n');
}

// 2 nights × $150 + $75 cleaning = $375; 5% tax = $18.75 → $393.75
const EXPECTED_TOTAL = 39375;

function request(overrides: Partial<Parameters<typeof service.requestBooking>[0]> = {}) {
  return service.requestBooking({
    unitSlug: 'cozy-cottage',
    checkIn: d(30),
    checkOut: d(32),
    guests: 2,
    pets: 0,
    guestName: 'Pat Guest',
    guestEmail: 'pat@example.com',
    guestPhone: '314-555-0100',
    specialRequests: null,
    acceptedPolicies: true,
    sourceId: 'cnon:card-nonce-ok',
    idempotencyKey: randomUUID(),
    expectedTotalCents: EXPECTED_TOTAL,
    ...overrides,
  });
}

let db: Awaited<ReturnType<typeof createTestDb>>['db'];

beforeAll(async () => {
  const t = await createTestDb();
  db = t.db;
  state.sql = t.sql;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(state.airbnbFeed, { status: state.airbnbStatus })),
  );
});

beforeEach(async () => {
  await db.exec('TRUNCATE bookings, external_bookings, calendar_blocks, calendar_sync_status');
  state.airbnbFeed = airbnbFeed([]);
  state.airbnbStatus = 200;
  vi.clearAllMocks();
});

const status = async (code: string) =>
  (await db.query<{ booking_status: string; payment_status: string }>(
    'SELECT booking_status, payment_status FROM bookings WHERE confirmation_code = $1',
    [code],
  )).rows[0];

describe('requestBooking', () => {
  it('holds the dates and authorizes exactly the server-computed total', async () => {
    const r = await request();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(square.authorizeCard).toHaveBeenCalledTimes(1);
    expect(square.authorizeCard.mock.calls[0][0]).toMatchObject({ amountCents: EXPECTED_TOTAL, holdHours: 48 });
    expect(await status(r.confirmationCode)).toEqual({ booking_status: 'requested', payment_status: 'authorized' });
    expect(email.sendRequestReceived).toHaveBeenCalled();
    expect(email.sendOwnerNewRequest).toHaveBeenCalled();
    const ranges = await getUnavailableRanges('unit-cottage', d(0), d(60));
    expect(ranges).toEqual([expect.objectContaining({ start: d(30), end: d(32), source: 'direct' })]);
  });

  it('refuses a client total that does not match the server price', async () => {
    const r = await request({ expectedTotalCents: 100 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe('price_changed');
      expect(r.quote?.totalCents).toBe(EXPECTED_TOTAL);
    }
    expect(square.authorizeCard).not.toHaveBeenCalled();
  });

  it('blocks dates reserved on Airbnb, refreshed at request time', async () => {
    state.airbnbFeed = airbnbFeed([[d(31), d(34)]]);
    const r = await request();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('dates_taken');
    expect(square.authorizeCard).not.toHaveBeenCalled();
  });

  it('frees dates when the Airbnb reservation is cancelled', async () => {
    state.airbnbFeed = airbnbFeed([[d(31), d(34)]]);
    expect((await request()).ok).toBe(false);
    state.airbnbFeed = airbnbFeed([]); // guest cancelled on Airbnb
    expect((await request()).ok).toBe(true);
  });

  it('keeps the last good Airbnb data when the feed is down, and warns the owner', async () => {
    state.airbnbFeed = airbnbFeed([[d(31), d(34)]]);
    await request(); // syncs the reservation
    state.airbnbStatus = 503;
    const r = await request();
    expect(r.ok).toBe(false); // still blocked by last good data
    const free = await request({ checkIn: d(40), checkOut: d(42) });
    expect(free.ok).toBe(true);
    expect(email.sendOwnerNewRequest.mock.calls.at(-1)).toContainEqual(expect.stringMatching(/could not refresh airbnb/i));
  });

  it('never lets two requests hold the same nights', async () => {
    const [a, b] = await Promise.all([request(), request({ checkIn: d(31), checkOut: d(33), expectedTotalCents: EXPECTED_TOTAL })]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
  });

  it('allows back-to-back stays', async () => {
    expect((await request()).ok).toBe(true);
    expect((await request({ checkIn: d(32), checkOut: d(34) })).ok).toBe(true);
  });

  it('releases the dates when the card is declined', async () => {
    square.authorizeCard.mockRejectedValueOnce(new Error('CARD_DECLINED'));
    const r = await request();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('payment_failed');
    expect(await getUnavailableRanges('unit-cottage', d(0), d(60))).toEqual([]);
    expect((await request()).ok).toBe(true);
  });
});

describe('owner decisions', () => {
  async function requested() {
    const r = await request();
    if (!r.ok) throw new Error(r.error);
    const { rows } = await db.query<{ id: string }>('SELECT id FROM bookings WHERE confirmation_code = $1', [r.confirmationCode]);
    return { id: rows[0].id, code: r.confirmationCode };
  }

  it('approve captures the payment and confirms', async () => {
    const { id, code } = await requested();
    const r = await service.approveBooking(id);
    expect(r.ok).toBe(true);
    expect(square.capturePayment).toHaveBeenCalledWith('sq-payment-1');
    expect(await status(code)).toEqual({ booking_status: 'confirmed', payment_status: 'paid' });
    expect(email.sendBookingConfirmed).toHaveBeenCalled();
    // A second click is a no-op.
    expect((await service.approveBooking(id)).ok).toBe(false);
    expect(square.capturePayment).toHaveBeenCalledTimes(1);
  });

  it('a failed capture leaves the request pending', async () => {
    const { id, code } = await requested();
    square.capturePayment.mockRejectedValueOnce(new Error('AUTHORIZATION_EXPIRED'));
    const r = await service.approveBooking(id);
    expect(r.ok).toBe(false);
    expect((await status(code)).booking_status).toBe('requested');
  });

  it('decline voids the hold and frees the dates', async () => {
    const { id, code } = await requested();
    const r = await service.declineBooking(id, 'Family visiting that week');
    expect(r.ok).toBe(true);
    expect(square.voidPayment).toHaveBeenCalledWith('sq-payment-1');
    expect(await status(code)).toEqual({ booking_status: 'declined', payment_status: 'voided' });
    expect(await getUnavailableRanges('unit-cottage', d(0), d(60))).toEqual([]);
  });

  it('unanswered requests expire and release the hold', async () => {
    const { code } = await requested();
    await db.query("UPDATE bookings SET expires_at = now() - interval '1 minute'");
    const r = await service.expireRequests();
    expect(r.expired).toBe(1);
    expect(square.voidPayment).toHaveBeenCalled();
    expect(await status(code)).toEqual({ booking_status: 'expired', payment_status: 'voided' });
    expect(email.sendRequestDeclined).toHaveBeenCalledWith(expect.anything(), 'expired', undefined);
  });

  it('cancel refunds the chosen amount and frees the dates', async () => {
    const { id, code } = await requested();
    await service.approveBooking(id);
    const tooMuch = await service.cancelBooking(id, EXPECTED_TOTAL + 1);
    expect(tooMuch.ok).toBe(false);
    const r = await service.cancelBooking(id, 20000, 'Partial refund per policy');
    expect(r.ok).toBe(true);
    expect(square.refundPayment.mock.calls[0][0]).toMatchObject({ paymentId: 'sq-payment-1', amountCents: 20000 });
    expect(await status(code)).toEqual({ booking_status: 'cancelled', payment_status: 'partially_refunded' });
    expect(await getUnavailableRanges('unit-cottage', d(0), d(60))).toEqual([]);
  });
});
