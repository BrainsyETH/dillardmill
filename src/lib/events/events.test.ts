import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createTestDb } from "@/test/pglite-sql";
import { addDays, todayAtProperty } from "@/lib/booking/dates";
import { eventActionSchema, eventInquirySchema } from "./input";
import { eventsPublished } from "./config";
const state = vi.hoisted(() => ({ sql: null as unknown }));
vi.mock("@/lib/db/client", () => ({
  get sql() {
    return state.sql;
  },
}));
const mail = vi.hoisted(() => ({
  notifyEventOwner: vi.fn(async () => true),
  acknowledgeEventInquiry: vi.fn(async () => true),
  remindEventHold: vi.fn(async () => true),
}));
vi.mock("./email", () => mail);
const calendars = vi.hoisted(() => ({
  syncUnit: vi.fn(async () => [] as { success: boolean }[]),
}));
vi.mock("@/lib/calendar/sync", () => calendars);
vi.mock("@/lib/booking/units", () => ({
  getAllBookableUnits: vi.fn(async () => [{ _id: "cozy-cottage" }]),
}));
vi.mock("@/lib/admin/require", () => ({
  requireAdmin: vi.fn(async () => ({ identity: "owner@example.com" })),
}));
vi.mock("@/lib/security/turnstile", () => ({
  verifyHuman: vi.fn(async () => null),
}));
const {
  receiveEventInquiry,
  updateEvent,
  getEventLead,
  expireEventHolds,
  processEventHolds,
  getEventBlocks,
} = await import("./service");
const { getUnavailableRanges } = await import("@/lib/db/availability");
const { holdBooking } = await import("@/lib/db/bookings");
const { quoteStay } = await import("@/lib/booking/pricing");
const { POST } = await import("@/app/api/events/inquiries/route");
const { GET: publicBrochure } =
  await import("@/app/(site)/weddings/brochure/route");
const d = (days: number) => addDays(todayAtProperty(), days);
function input() {
  return {
    submissionId: randomUUID(),
    name: "Avery Guest",
    email: "avery@example.com",
    eventType: "wedding" as const,
    eventDate: d(30),
    guests: 100,
    overnightGuests: 28,
    message: "A wedding weekend.",
  };
}
let db: Awaited<ReturnType<typeof createTestDb>>["db"];
beforeAll(async () => {
  const t = await createTestDb();
  db = t.db;
  state.sql = t.sql;
});
beforeEach(async () => {
  await db.exec(
    "TRUNCATE guest_messages, event_reservations, bookings, inventory_reservations, calendar_blocks, external_bookings CASCADE",
  );
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mail.notifyEventOwner.mockResolvedValue(true);
  mail.acknowledgeEventInquiry.mockResolvedValue(true);
  mail.remindEventHold.mockResolvedValue(true);
  calendars.syncUnit.mockResolvedValue([]);
});
async function newLead() {
  const r = await receiveEventInquiry(input(), false);
  if (!r.ok) throw new Error(r.error);
  return r.id;
}
async function hold(id: string, start = d(30), end = d(32)) {
  return updateEvent(
    id,
    { action: "hold", start, end, expiresOn: d(3), calendarsChecked: true },
    "owner@example.com",
  );
}
async function booking(start = d(30), end = d(32)) {
  const priced = quoteStay(
    { basePrice: 150, maxGuests: 4 },
    { checkIn: start, checkOut: end, guests: 2, pets: 0 },
    [],
    todayAtProperty(),
  );
  if (!priced.ok) throw new Error("Invalid fixture");
  return holdBooking({
    unitId: "cozy-cottage",
    unitSlug: "cozy-cottage",
    unitName: "Cozy Cottage",
    quote: priced.quote,
    guestName: "River Guest",
    guestEmail: "river@example.com",
    guestPhone: "3145550100",
  });
}
async function reservation(id: string) {
  return (await getEventLead(id))!.reservations[0];
}
async function confirm(id: string, keys: string[] = []) {
  const r = await reservation(id);
  return updateEvent(
    id,
    {
      action: "confirm",
      reservationId: r.id,
      agreementConfirmed: true,
      calendarsChecked: true,
      externalBlockKeys: keys,
    },
    "owner@example.com",
  );
}
async function imported(
  kind: "block" | "reservation",
  start = d(30),
  end = d(32),
) {
  await db.query(
    "INSERT INTO external_bookings(unit_id, check_in, check_out, source, kind) VALUES ('cozy-cottage', $1, $2, 'airbnb', $3)",
    [start, end, kind],
  );
}

describe("Event inquiries and release gate", () => {
  it("distinguishes 100 daytime guests from 50 overnight guests", () => {
    expect(eventInquirySchema.safeParse(input()).success).toBe(true);
    expect(
      eventInquirySchema.safeParse({ ...input(), guests: 101 }).success,
    ).toBe(false);
    expect(
      eventInquirySchema.safeParse({ ...input(), overnightGuests: 51 }).success,
    ).toBe(false);
    expect(
      eventInquirySchema.safeParse({
        ...input(),
        guests: 10,
        overnightGuests: 11,
      }).success,
    ).toBe(false);
  });
  it("allows flexible dates without forcing an invented event date", () => {
    expect(
      eventInquirySchema.safeParse({
        ...input(),
        eventDate: undefined,
        dateFlexibility: "September weekends",
      }).success,
    ).toBe(true);
    expect(
      eventInquirySchema.safeParse({ ...input(), eventDate: undefined })
        .success,
    ).toBe(false);
    expect(
      eventInquirySchema.safeParse({ ...input(), eventDate: "2027-02-30" })
        .success,
    ).toBe(false);
  });
  it("requires external-calendar and contract checks before confirmation", () => {
    expect(
      eventActionSchema.safeParse({
        action: "confirm",
        reservationId: randomUUID(),
        calendarsChecked: true,
      }).success,
    ).toBe(false);
  });
  it("is unpublished by default and rejects public submissions before storage", async () => {
    expect(eventsPublished()).toBe(false);
    const response = await POST(
      new NextRequest("https://example.com/api/events/inquiries", {
        method: "POST",
        body: JSON.stringify(input()),
      }),
    );
    expect(response.status).toBe(404);
    expect((await db.query("SELECT * FROM guest_messages")).rows).toHaveLength(
      0,
    );
  });
  it("keeps the brochure private until publication and serves a PDF after release", async () => {
    expect((await publicBrochure()).status).toBe(404);
    vi.stubEnv("EVENTS_PUBLISHED", "true");
    const response = await publicBrochure();
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect((await response.text()).startsWith("%PDF-")).toBe(true);
  });
  it("public submission saves the inquiry and acknowledges it without reserving dates", async () => {
    vi.stubEnv("EVENTS_PUBLISHED", "true");
    const response = await POST(
      new NextRequest("https://example.com/api/events/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "https://example.com",
          host: "example.com",
        },
        body: JSON.stringify(input()),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mail.acknowledgeEventInquiry).toHaveBeenCalledOnce();
    expect(
      (await db.query("SELECT * FROM event_reservations")).rows,
    ).toHaveLength(0);
  });
  it("preserves the message when email fails, and deduplicates a retry", async () => {
    mail.acknowledgeEventInquiry.mockResolvedValue(false);
    mail.notifyEventOwner.mockResolvedValue(false);
    const data = input();
    const first = await receiveEventInquiry(data);
    const second = await receiveEventInquiry(data);
    expect(first).toEqual(second);
    expect(mail.acknowledgeEventInquiry).toHaveBeenCalledOnce();
    expect(
      (
        await db.query(
          "SELECT guest_notified, owner_notified FROM guest_messages",
        )
      ).rows,
    ).toEqual([{ guest_notified: false, owner_notified: false }]);
  });
  it("owner-entered leads do not send guest email", async () => {
    await newLead();
    expect(mail.acknowledgeEventInquiry).not.toHaveBeenCalled();
    expect(mail.notifyEventOwner).not.toHaveBeenCalled();
  });
});

describe("Whole-property event reservations", () => {
  it("blocks every lodging unit, while checkout-day arrivals remain available", async () => {
    const id = await newLead();
    await hold(id);
    expect(
      await getUnavailableRanges("original-airstream", d(29), d(33)),
    ).toMatchObject([
      { source: "event", start: d(30), end: d(32), label: null },
    ]);
    expect(await booking()).toMatchObject({ ok: false });
    expect(await booking(d(32), d(34))).toMatchObject({ ok: true });
  });
  it("refuses an event over an existing individual lodging request", async () => {
    expect(await booking()).toMatchObject({ ok: true });
    await expect(hold(await newLead())).rejects.toThrow("overlap");
  });
  it("the database allows only one winner when booking and event reservations race", async () => {
    const id = await newLead();
    const [a, b] = await Promise.allSettled([hold(id), booking()]);
    const eventWon = a.status === "fulfilled";
    const bookingWon = b.status === "fulfilled" && b.value.ok;
    expect(Number(eventWon) + Number(bookingWon)).toBe(1);
    expect(
      (await db.query("SELECT * FROM inventory_reservations")).rows,
    ).toHaveLength(1);
  });
  it("does not allow a second event to reserve the same dates", async () => {
    await hold(await newLead());
    await expect(hold(await newLead())).rejects.toThrow("overlap");
  });
  it("honors owner blocks, imported reservations and imported blocks on a new hold", async () => {
    const id = await newLead();
    await imported("block");
    await expect(hold(id)).rejects.toThrow("overlap");
    await db.exec("DELETE FROM external_bookings");
    await imported("reservation");
    await expect(hold(id)).rejects.toThrow("overlap");
    await db.exec("DELETE FROM external_bookings");
    await db.query(
      "INSERT INTO calendar_blocks(unit_id,start_date,end_date) VALUES ('cozy-cottage',$1,$2)",
      [d(30), d(32)],
    );
    await expect(hold(id)).rejects.toThrow("overlap");
  });
  it("requires exact acknowledgement of imported blocks when confirming a held event", async () => {
    const id = await newLead();
    await hold(id);
    await imported("block");
    await expect(confirm(id)).rejects.toThrow("overlap");
    const keys = (await getEventBlocks(d(30), d(32))).map((b) => b.key);
    await imported("block", d(31), d(33));
    await expect(confirm(id, keys)).rejects.toThrow("overlap");
    await confirm(
      id,
      (await getEventBlocks(d(30), d(32))).map((b) => b.key),
    );
    expect((await reservation(id)).status).toBe("confirmed");
  });
  it("keeps the dates continuously reserved when a hold becomes confirmed", async () => {
    const id = await newLead();
    await hold(id);
    const before = (
      await db.query<{ id: string }>("SELECT id FROM inventory_reservations")
    ).rows[0].id;
    await confirm(id);
    expect(
      (await db.query<{ id: string }>("SELECT id FROM inventory_reservations"))
        .rows[0].id,
    ).toBe(before);
    expect((await reservation(id)).expires_at).toBe(null);
    expect(await booking()).toMatchObject({ ok: false });
  });
  it("refuses confirmation if a real external reservation arrives after the hold", async () => {
    const id = await newLead();
    await hold(id);
    await imported("reservation");
    await expect(confirm(id)).rejects.toThrow("overlap");
  });
  it("frees expired holds on the booking path even if cron has not run", async () => {
    const id = await newLead();
    await hold(id);
    // Advance expiry without invoking the expiry trigger, to simulate the clock.
    await db.exec(
      "ALTER TABLE event_reservations DISABLE TRIGGER events_shared_inventory",
    );
    await db.exec(
      "UPDATE event_reservations SET expires_at = now() - interval '1 minute'",
    );
    await db.exec(
      "ALTER TABLE event_reservations ENABLE TRIGGER events_shared_inventory",
    );
    expect(
      await getUnavailableRanges("cozy-cottage", d(30), d(32)),
    ).toHaveLength(0);
    expect(await booking()).toMatchObject({ ok: true });
    await expect(confirm(id)).rejects.toThrow("changed or expired");
  });
  it("expires holds and refuses to revive an expired reservation", async () => {
    const id = await newLead();
    await hold(id);
    const r = await reservation(id);
    await db.exec(
      "UPDATE event_reservations SET expires_at = now() - interval '1 minute'",
    );
    expect(await expireEventHolds()).toBe(1);
    await expect(
      updateEvent(
        id,
        { action: "extend", reservationId: r.id, expiresOn: d(6) },
        "owner",
      ),
    ).rejects.toThrow("changed or expired");
    await hold(id);
    expect((await reservation(id)).status).toBe("held");
  });
  it("releases dates and prevents changing another inquiry’s hold", async () => {
    const id = await newLead();
    await hold(id);
    const r = await reservation(id);
    await expect(
      updateEvent(
        await newLead(),
        { action: "release", reservationId: r.id },
        "owner",
      ),
    ).rejects.toThrow("changed or expired");
    await updateEvent(id, { action: "release", reservationId: r.id }, "owner");
    expect(await booking()).toMatchObject({ ok: true });
  });
  it("does not let a lead be closed while its dates remain reserved", async () => {
    const id = await newLead();
    await hold(id);
    await expect(
      updateEvent(
        id,
        {
          action: "update",
          stage: "closed",
          assignedTo: "",
          followUpOn: "",
          notes: "",
        },
        "owner",
      ),
    ).rejects.toThrow("Release");
  });
  it("records the hold-through date as end of day in Central time", async () => {
    const id = await newLead();
    await hold(id);
    const row = (
      await db.query<{ local: string }>(
        "SELECT (expires_at AT TIME ZONE 'America/Chicago')::text AS local FROM event_reservations",
      )
    ).rows[0];
    expect(row.local).toBe(`${d(4)} 00:00:00`);
  });
  it("refuses new holds when a configured calendar cannot refresh", async () => {
    calendars.syncUnit.mockResolvedValue([{ success: false }]);
    await expect(hold(await newLead())).rejects.toThrow(
      "could not be refreshed",
    );
  });
  it("sends one expiry reminder, retrying a failed delivery", async () => {
    const id = await newLead();
    await hold(id);
    await db.exec(
      "UPDATE event_reservations SET expires_at = now() + interval '1 hour'",
    );
    mail.remindEventHold.mockResolvedValueOnce(false);
    expect(await processEventHolds()).toEqual({ expired: 0, reminded: 0 });
    expect(await processEventHolds()).toEqual({ expired: 0, reminded: 1 });
    expect(await processEventHolds()).toEqual({ expired: 0, reminded: 0 });
    expect(mail.remindEventHold).toHaveBeenCalledTimes(2);
  });
});
