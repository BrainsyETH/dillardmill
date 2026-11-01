"use client";
import { useCallback, useState } from "react";
import { DatePicker } from "./DatePicker";
import { getUnitUrl } from "@/lib/utils/slugToUrl";
export function AvailabilityCalendar({
  unitSlug,
  minStay = 1,
}: {
  unitSlug: string;
  minStay?: number;
}) {
  const [dates, setDates] = useState<{ checkIn?: string; checkOut?: string }>(
    {},
  );
  const change = useCallback(
    (checkIn?: string, checkOut?: string) => setDates({ checkIn, checkOut }),
    [],
  );
  const query = new URLSearchParams(
    dates.checkIn && dates.checkOut
      ? { checkIn: dates.checkIn, checkOut: dates.checkOut }
      : {},
  ).toString();
  return (
    <div className="max-w-sm">
      <DatePicker
        unitSlug={unitSlug}
        minStay={minStay}
        checkIn={dates.checkIn}
        checkOut={dates.checkOut}
        onChange={change}
      />
      <a
        href={`${getUnitUrl(unitSlug)}${query ? `?${query}` : ""}#stay-request`}
        target="_top"
        className="btn btn-primary w-full mt-6"
      >
        {query ? "See price and request a stay" : "View this stay"}
      </a>
      <p className="text-sm mt-3 text-brand-stone">
        Requests are reviewed by your hosts. Dates are checked again when you
        submit.
      </p>
    </div>
  );
}
