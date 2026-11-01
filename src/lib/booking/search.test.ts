import { describe, expect, it } from "vitest";
import { matchesStay, parseStaySearch } from "./search";
import { addDays, todayAtProperty } from "./dates";
import type { RentalUnit } from "@/lib/sanity/schemas";
const unit = {
  slug: { current: "cozy-cottage" },
  maxGuests: 4,
  minStay: 2,
  petsAllowed: true,
  maxPets: 1,
} as RentalUnit;
describe("stay search", () => {
  it("supports guest-only searches and excludes undersized stays", () => {
    const s = parseStaySearch({ guests: "5" });
    expect(s.error).toBeNull();
    expect(s.hasDates).toBe(false);
    expect(matchesStay(unit, s)).toBe(false);
  });
  it("respects minimum nights and pet capacity", () => {
    expect(
      matchesStay(
        unit,
        parseStaySearch({
          checkIn: addDays(todayAtProperty(), 5),
          checkOut: addDays(todayAtProperty(), 6),
        }),
      ),
    ).toBe(false);
    expect(matchesStay(unit, parseStaySearch({ pets: "2" }))).toBe(false);
  });
  it("rejects impossible or incomplete dates and invalid group counts", () => {
    expect(
      parseStaySearch({ checkIn: "2030-02-30", checkOut: "2030-03-04" }).error,
    ).toBeTruthy();
    expect(parseStaySearch({ checkOut: "2030-03-04" }).error).toBeTruthy();
    expect(parseStaySearch({ guests: "2.5" }).error).toBeTruthy();
  });
});
