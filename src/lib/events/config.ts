/** Server-only release switch. Every public event route/API checks this. */
export function eventsPublished() {
  return process.env.EVENTS_PUBLISHED === "true";
}
export function tourBookingUrl() {
  try {
    const url = new URL(process.env.EVENT_TOUR_URL || "");
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
