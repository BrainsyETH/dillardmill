"use client";
import { useState } from "react";
import Link from "next/link";
import { todayAtProperty, addDays, isIsoDate } from "@/lib/booking/dates";
export default function AvailabilitySearch({
  initial = {},
}: {
  initial?: Record<string, string>;
}) {
  const [checkIn, setCheckIn] = useState(initial.checkIn || "");
  return (
    <form
      action="/lodging"
      method="get"
      aria-label="Find a stay"
      className="border-y border-brand-sand py-6 my-8"
    >
      <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_.65fr_.65fr_auto] gap-4 items-end">
        <label className="field-label">
          Check in
          <input
            className="field"
            type="date"
            name="checkIn"
            min={todayAtProperty()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>
        <label className="field-label">
          Check out
          <input
            className="field"
            type="date"
            name="checkOut"
            min={
              isIsoDate(checkIn)
                ? addDays(checkIn, 1)
                : addDays(todayAtProperty(), 1)
            }
            defaultValue={initial.checkOut}
            required={!!checkIn}
          />
        </label>
        <label className="field-label">
          Guests
          <select
            className="field"
            name="guests"
            defaultValue={initial.guests || "2"}
          >
            {Array.from({ length: 50 }, (_, n) => n + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Pets
          <select
            className="field"
            name="pets"
            defaultValue={initial.pets || "0"}
          >
            {Array.from({ length: 6 }, (_, n) => (
              <option key={n} value={n}>
                {n ? `${n} pet${n === 1 ? "" : "s"}` : "No pets"}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn btn-primary col-span-2 lg:col-span-1"
          type="submit"
        >
          Find stays
        </button>
      </div>
      <p className="mt-3 text-sm text-brand-stone">
        Dates are optional. Search by group size, or add dates for availability
        and your total.
        {Object.values(initial).some(Boolean) && (
          <Link className="underline ml-3" href="/lodging">
            Clear search
          </Link>
        )}
      </p>
    </form>
  );
}
