import { getAllBookableUnits, type BookableUnit } from "./units";

/** A whole-property listing (the Farm) and every other stay share inventory, in both directions. */
export function conflictingUnits(
  unit: BookableUnit,
  all: BookableUnit[],
): BookableUnit[] {
  const related = unit.isWholeProperty
    ? all
    : all.filter((u) => u._id === unit._id || u.isWholeProperty);
  return [...new Map([unit, ...related].map((u) => [u._id, u])).values()];
}

export async function getInventoryUnits(unit: BookableUnit) {
  return conflictingUnits(unit, await getAllBookableUnits());
}
