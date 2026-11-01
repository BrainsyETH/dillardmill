import type { RentalUnit } from "@/lib/stays/types";
import { isIsoDate, nightsBetween, todayAtProperty } from "./dates";
export function parseStaySearch(params: Record<string, string>) {
  const guests = params.guests ? Number(params.guests) : 2;
  const pets = params.pets ? Number(params.pets) : 0;
  const hasDates = Boolean(params.checkIn || params.checkOut);
  const validDates =
    isIsoDate(params.checkIn) &&
    isIsoDate(params.checkOut) &&
    params.checkIn >= todayAtProperty() &&
    params.checkOut > params.checkIn;
  const error =
    !Number.isInteger(guests) || guests < 1 || guests > 50
      ? "Choose between 1 and 50 guests."
      : !Number.isInteger(pets) || pets < 0 || pets > 5
        ? "Choose between 0 and 5 pets."
        : hasDates && !validDates
          ? "Choose future check-in and check-out dates, or leave both blank."
          : null;
  return {
    guests,
    pets,
    hasDates: validDates,
    nights: validDates ? nightsBetween(params.checkIn, params.checkOut) : 0,
    error,
  };
}
export function matchesStay(
  unit: RentalUnit,
  search: ReturnType<typeof parseStaySearch>,
) {
  return (
    !unit.isWholeProperty &&
    unit.maxGuests >= search.guests &&
    (!search.pets ||
      (unit.petsAllowed &&
        (unit.maxPets == null || unit.maxPets >= search.pets))) &&
    (!search.nights || search.nights >= (unit.minStay ?? 1))
  );
}
