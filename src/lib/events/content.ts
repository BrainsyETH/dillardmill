// Prices and the 100-person event cap confirmed by the owner, 1 November 2026.
// Overnight occupancy is distinct from event attendance. Terms are agreed by quote.
export const EVENT_CAPACITY = 100;
export const OVERNIGHT_CAPACITY = 50;
export const weddingPackages = [
  {
    id: "riverside-escape",
    name: "Riverside Escape",
    price: 2800,
    nights: 2,
    stay: "Friday noon – Sunday noon",
    lodging: "14 overnight guests included",
    includes: [
      "All eight accommodations",
      "Barn and grounds",
      "Private creek access",
      "Campfire pits",
    ],
  },
  {
    id: "ozarks-micro-wedding",
    name: "Ozarks Micro Wedding",
    price: 6000,
    nights: 2,
    stay: "Friday noon – Sunday noon",
    lodging: "28 overnight guests included",
    includes: [
      "All eight accommodations",
      "Barn, patio and courtyard",
      "Three RV sites · 30 amp · up to 30 ft",
      "Cleaning included",
    ],
  },
  {
    id: "farm-long-weekend",
    name: "Farm Long Weekend",
    price: 8000,
    nights: 3,
    stay: "Thursday noon – Sunday noon",
    lodging: "28 in lodging · up to 50 overnight with camping",
    includes: [
      "All eight accommodations",
      "Private creek access and courtyard",
      "Three RV sites · 30 amp · up to 30 ft",
      "Camping and cleaning included",
    ],
  },
] as const;
export type PackageId = (typeof weddingPackages)[number]["id"];
export const eventTypes = {
  wedding: "Wedding",
  reunion: "Family reunion",
  retreat: "Retreat",
  celebration: "Private celebration",
  other: "Other event",
} as const;
export const eventStages = {
  new: "New",
  replied: "Replied",
  tour: "Tour scheduled",
  closed: "Closed",
} as const;
export function packageName(id: string | null | undefined) {
  return weddingPackages.find((p) => p.id === id)?.name || "Help me choose";
}
