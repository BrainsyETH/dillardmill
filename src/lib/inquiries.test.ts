import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createTestDb } from "@/test/pglite-sql";
import { addDays, todayAtProperty } from "@/lib/booking/dates";
const state = vi.hoisted(() => ({ sql: null as unknown, notified: true }));
vi.mock("@/lib/db/client", () => ({
  get sql() {
    return state.sql;
  },
}));
const notify = vi.hoisted(() => vi.fn(async () => state.notified));
vi.mock("@/lib/email/resend", () => ({ sendGuestMessageNotification: notify }));
const { POST } = await import("@/app/api/inquiries/route");
let db: Awaited<ReturnType<typeof createTestDb>>["db"];
beforeAll(async () => {
  const test = await createTestDb();
  db = test.db;
  state.sql = test.sql;
});
beforeEach(async () => {
  await db.exec("TRUNCATE guest_messages");
  state.notified = true;
  vi.clearAllMocks();
});
const message = () => ({
  submissionId: randomUUID(),
  kind: "inquiry",
  name: "Pat Guest",
  email: "pat@example.com",
  unitSlug: "book-the-farm",
  guests: 12,
  checkIn: addDays(todayAtProperty(), 20),
  checkOut: addDays(todayAtProperty(), 22),
  message: "A family reunion for twelve.",
  website: "",
});
const send = (body: unknown, origin = "http://localhost") =>
  POST(
    new NextRequest("http://localhost/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost",
        origin,
      },
      body: JSON.stringify(body),
    }),
  );
describe("guest inquiry → API → Postgres → notification", () => {
  it("saves the stay, dates, group, and message before reporting success, without creating a booking", async () => {
    const response = await send(message());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const { rows } = await db.query(
      "SELECT unit_slug, guests, message, owner_notified FROM guest_messages",
    );
    expect(rows).toEqual([
      {
        unit_slug: "book-the-farm",
        guests: 12,
        message: "A family reunion for twelve.",
        owner_notified: true,
      },
    ]);
    expect((await db.query("SELECT id FROM bookings")).rows).toHaveLength(0);
    expect(notify).toHaveBeenCalledOnce();
  });
  it("keeps a retried submission idempotent", async () => {
    const body = message();
    await send(body);
    await send(body);
    expect((await db.query("SELECT id FROM guest_messages")).rows).toHaveLength(
      1,
    );
    expect(notify).toHaveBeenCalledOnce();
  });
  it("keeps a message visible in admin when email fails", async () => {
    state.notified = false;
    expect((await send(message())).status).toBe(200);
    expect(
      (await db.query("SELECT owner_notified FROM guest_messages")).rows,
    ).toEqual([{ owner_notified: false }]);
  });
  it("rejects invalid dates, missing group size, honeypot, and cross-site submissions without saving", async () => {
    expect((await send({ ...message(), checkOut: "2000-01-01" })).status).toBe(
      400,
    );
    expect((await send({ ...message(), guests: undefined })).status).toBe(400);
    expect((await send({ ...message(), website: "spam" })).status).toBe(400);
    expect((await send(message(), "https://other.example")).status).toBe(403);
    expect((await send(message(), "not-an-origin")).status).toBe(403);
    expect((await db.query("SELECT id FROM guest_messages")).rows).toHaveLength(
      0,
    );
  });
  it("limits repeat messages", async () => {
    for (let i = 0; i < 5; i++)
      expect((await send(message())).status).toBe(200);
    expect((await send(message())).status).toBe(429);
  });
  it("never returns success when storage fails", async () => {
    const original = state.sql;
    state.sql = () => Promise.reject(new Error("Offline"));
    try {
      const response = await send(message());
      expect(response.status).toBe(503);
      expect(await response.json()).not.toHaveProperty("ok", true);
    } finally {
      state.sql = original;
    }
  });
});
