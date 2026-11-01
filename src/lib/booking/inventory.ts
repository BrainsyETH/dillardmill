import { getAllBookableUnits, type BookableUnit } from "./units";

/** The whole Farm and each of its stays share inventory, in both directions. */
export function conflictingUnits(
  unit: BookableUnit,
  all: BookableUnit[],
): BookableUnit[] {
  const related =
    unit.slug === "book-the-farm"
      ? all
      : all.filter((u) => u._id === unit._id || u.slug === "book-the-farm");
  return [...new Map([unit, ...related].map((u) => [u._id, u])).values()];
}

export async function getInventoryUnits(unit: BookableUnit) {
  return conflictingUnits(unit, await getAllBookableUnits());
}
