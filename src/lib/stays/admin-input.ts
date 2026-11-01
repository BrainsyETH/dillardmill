// Parse and validate /admin form submissions for stays and settings.
// Dollar fields are entered as "150" or "150.00" and stored as cents.

import { z } from 'zod';
import { isIsoDate } from '@/lib/booking/dates';
import type { SettingsRecord, UnitInput } from './repository';

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v));

const money = (label: string) =>
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (v === '') return 0;
      const clean = v.replace(/[$,\s]/g, '');
      if (!/^\d{1,6}(\.\d{1,2})?$/.test(clean)) {
        ctx.addIssue({ code: 'custom', message: `${label}: enter an amount like 150 or 150.00` });
        return z.NEVER;
      }
      return Math.round(Number(clean) * 100);
    });

const int = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      const n = Number(v);
      if (v === '' || !Number.isInteger(n) || n < min || n > max) {
        ctx.addIssue({ code: 'custom', message: `${label}: enter a whole number from ${min} to ${max}` });
        return z.NEVER;
      }
      return n;
    });

const optionalInt = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (v === '') return null;
      const n = Number(v);
      if (!Number.isInteger(n) || n < min || n > max) {
        ctx.addIssue({ code: 'custom', message: `${label}: enter a whole number from ${min} to ${max}, or leave blank` });
        return z.NEVER;
      }
      return n;
    });

const url = (label: string) =>
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (v === '') return null;
      try {
        const u = new URL(v);
        if (u.protocol !== 'https:') throw new Error();
        return u.toString();
      } catch {
        ctx.addIssue({ code: 'custom', message: `${label}: enter a full https:// link, or leave blank` });
        return z.NEVER;
      }
    });

const checkbox = z
  .union([z.literal('on'), z.literal('true'), z.null(), z.undefined()])
  .transform((v) => v === 'on' || v === 'true');

const unitFields = z.object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Web address: lowercase letters, numbers and dashes only'),
    shortDescription: text(600),
    sortOrder: int('Sort order', -1000, 1000),
    listed: checkbox,
    directBookingEnabled: checkbox,
    isWholeProperty: checkbox,
    basePriceCents: money('Nightly price'),
    cleaningFeeCents: money('Cleaning fee'),
    maxGuests: int('Maximum guests', 1, 500),
    baseGuests: optionalInt('Guests included in price', 1, 500),
    extraGuestFeeCents: money('Extra guest fee'),
    petsAllowed: checkbox,
    maxPets: int('Maximum pets', 0, 20),
    petFeeCents: money('Pet fee'),
    minStay: int('Minimum nights', 1, 60),
    airbnbIcalUrl: url('Airbnb calendar link'),
    hipcampIcalUrl: url('Hipcamp calendar link'),
    vrboIcalUrl: url('VRBO calendar link'),
    airbnbUrl: url('Airbnb listing'),
    hipcampUrl: url('Hipcamp listing'),
    vrboUrl: url('VRBO listing'),
});

const unitSchema = unitFields.superRefine((u, ctx) => {
    if (u.directBookingEnabled && u.basePriceCents <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Set a nightly price before turning on online requests.' });
    }
    if (u.baseGuests != null && u.baseGuests > u.maxGuests) {
      ctx.addIssue({ code: 'custom', message: 'Guests included in price cannot exceed maximum guests.' });
    }
  });

const field = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === 'string' ? v : v === null ? undefined : '';
};

function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Please check the form.';
}

export function parseUnitForm(form: FormData): Parsed<UnitInput> {
  const raw: Record<string, string | undefined> = Object.fromEntries(
    Object.keys(unitFields.shape).map((k) => [k, field(form, k) ?? (k === 'sortOrder' ? '0' : '')]),
  );
  // Checkboxes are absent when unchecked.
  for (const k of ['listed', 'directBookingEnabled', 'isWholeProperty', 'petsAllowed']) {
    raw[k] = form.get(k) === null ? undefined : field(form, k);
  }
  if (raw.maxPets === '') raw.maxPets = '0';
  const parsed = unitSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const v = parsed.data;
  return {
    ok: true,
    value: { ...v, maxPets: v.petsAllowed ? v.maxPets : 0, petFeeCents: v.petsAllowed ? v.petFeeCents : 0 },
  };
}

const seasonSchema = z
  .object({
    name: z.string().trim().min(1, 'Season name is required').max(80),
    startDate: z.string().refine(isIsoDate, 'Choose a start date'),
    endDate: z.string().refine(isIsoDate, 'Choose an end date'),
    priceCents: money('Season price'),
  })
  .refine((s) => s.endDate >= s.startDate, 'The season must end on or after it starts.')
  .refine((s) => s.priceCents > 0, 'Enter a nightly price for the season.');

export function parseSeasonForm(form: FormData): Parsed<z.infer<typeof seasonSchema>> {
  const parsed = seasonSchema.safeParse({
    name: field(form, 'name') ?? '',
    startDate: field(form, 'startDate') ?? '',
    endDate: field(form, 'endDate') ?? '',
    priceCents: field(form, 'price') ?? '',
  });
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false, error: firstError(parsed.error) };
}

export function parseTaxForm(form: FormData): Parsed<{ name: string; ratePercent: number }> {
  const parsed = z
    .object({
      name: z.string().trim().min(1, 'Tax name is required').max(80),
      ratePercent: z
        .string()
        .trim()
        .regex(/^\d{1,2}(\.\d{1,3})?$/, 'Rate: enter a percentage like 4.225')
        .transform(Number)
        .refine((n) => n > 0 && n <= 30, 'Rate must be between 0 and 30%'),
    })
    .safeParse({ name: field(form, 'name') ?? '', ratePercent: field(form, 'ratePercent') ?? '' });
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false, error: firstError(parsed.error) };
}

export function parseSettingsForm(form: FormData): Parsed<SettingsRecord> {
  const parsed = z
    .object({
      cancellationPolicy: text(5000),
      houseRules: text(5000),
      checkInTime: text(40),
      checkOutTime: text(40),
      requestResponseHours: int('Hours to respond', 1, 144),
    })
    .safeParse({
      cancellationPolicy: field(form, 'cancellationPolicy') ?? '',
      houseRules: field(form, 'houseRules') ?? '',
      checkInTime: field(form, 'checkInTime') ?? '',
      checkOutTime: field(form, 'checkOutTime') ?? '',
      requestResponseHours: field(form, 'requestResponseHours') ?? '',
    });
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false, error: firstError(parsed.error) };
}

/** Cents → "150.00" for form inputs; blank for zero. */
export function centsToInput(cents: number): string {
  return cents ? (cents / 100).toFixed(2) : '';
}
