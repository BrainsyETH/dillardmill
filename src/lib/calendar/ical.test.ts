import { describe, expect, it } from "vitest";
import { buildICalFeed, parseICalFeed } from "./ical";

// Shape of a real Airbnb export: all-day DATE values, "Reserved" and
// "Airbnb (Not available)" summaries.
const airbnbFeed = [
  "BEGIN:VCALENDAR",
  "PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "DTEND;VALUE=DATE:20261112",
  "DTSTART;VALUE=DATE:20261109",
  "UID:1418fb94e984-abc@airbnb.com",
  "SUMMARY:Reserved",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTEND;VALUE=DATE:20261201",
  "DTSTART;VALUE=DATE:20261130",
  "UID:7f2a-blocked@airbnb.com",
  "SUMMARY:Airbnb (Not available)",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTEND;VALUE=DATE:20261205",
  "DTSTART;VALUE=DATE:20261203",
  "UID:gone@airbnb.com",
  "STATUS:CANCELLED",
  "SUMMARY:Reserved",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("parseICalFeed", () => {
  it("reads all-day reservations as check-in/check-out dates", () => {
    const events = parseICalFeed(airbnbFeed);
    expect(events).toEqual([
      {
        uid: "1418fb94e984-abc@airbnb.com",
        checkIn: "2026-11-09",
        checkOut: "2026-11-12",
        summary: "Reserved",
      },
      {
        uid: "7f2a-blocked@airbnb.com",
        checkIn: "2026-11-30",
        checkOut: "2026-12-01",
        summary: "Airbnb (Not available)",
      },
    ]);
  });

  it("maps timed events to the property date, not the server date", () => {
    const feed = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "UID:timed",
      // 03:00 UTC Nov 10 = 21:00 Central Nov 9
      "DTSTART:20261110T030000Z",
      "DTEND:20261112T160000Z",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    expect(parseICalFeed(feed)[0]).toMatchObject({
      checkIn: "2026-11-09",
      checkOut: "2026-11-12",
    });
  });

  it("treats a missing DTEND as one night", () => {
    const feed =
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:x\r\nDTSTART;VALUE=DATE:20261109\r\nEND:VEVENT\r\nEND:VCALENDAR";
    expect(parseICalFeed(feed)[0]).toMatchObject({
      checkIn: "2026-11-09",
      checkOut: "2026-11-10",
    });
  });
});

describe("buildICalFeed", () => {
  it("round-trips through the parser with no guest details", () => {
    const ics = buildICalFeed("Cozy Cottage", [
      {
        uid: "b1@dillardmill.com",
        start: "2026-11-20",
        end: "2026-11-23",
        summary: "Reserved",
      },
    ]);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261120");
    expect(ics.split("\r\n").length).toBeGreaterThan(5);
    expect(parseICalFeed(ics)).toEqual([
      {
        uid: "b1@dillardmill.com",
        checkIn: "2026-11-20",
        checkOut: "2026-11-23",
        summary: "Reserved",
      },
    ]);
  });
});

describe("imported event kinds", () => {
  it("separates Airbnb reservations from blocks", async () => {
    const { classifyImportedEvent } = await import("./ical");
    expect(classifyImportedEvent("Reserved")).toBe("reservation");
    expect(classifyImportedEvent("Airbnb (Not available)")).toBe("block");
    expect(classifyImportedEvent("Blocked")).toBe("block");
    expect(classifyImportedEvent(null)).toBe("reservation");
  });

  it("recognises a request's own echo, but not a wider or real conflict", async () => {
    const { isEchoOf } = await import("./ical");
    const stay = { checkIn: "2026-11-10", checkOut: "2026-11-12" };
    expect(
      isEchoOf({ start: "2026-11-10", end: "2026-11-12", kind: "block" }, stay),
    ).toBe(true);
    expect(
      isEchoOf({ start: "2026-11-09", end: "2026-11-12", kind: "block" }, stay),
    ).toBe(false);
    expect(
      isEchoOf(
        { start: "2026-11-10", end: "2026-11-12", kind: "reservation" },
        stay,
      ),
    ).toBe(false);
  });
});
