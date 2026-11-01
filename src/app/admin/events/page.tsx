import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require";
import { eventsPublished } from "@/lib/events/config";
import { eventStages, eventTypes } from "@/lib/events/content";
import { listEventLeads } from "@/lib/events/service";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Events | Pine Valley",
  robots: { index: false },
};
export default async function EventsAdmin() {
  await requireAdmin();
  const leads = await listEventLeads();
  return (
    <main className="page-shell py-10">
      <Link href="/admin" className="text-link">
        ← Dashboard
      </Link>
      <div className="flex flex-wrap gap-5 justify-between items-end mt-7 mb-8">
        <div>
          <h1 className="page-title mb-3">Events</h1>
          <p className="text-sm">
            {eventsPublished()
              ? "Wedding and event inquiries are open."
              : "Wedding and event pages are not published."}
          </p>
        </div>
        <div className="flex flex-wrap gap-5 items-center">
          <Link href="/admin/events/preview" className="text-link">
            Preview the pages ↗
          </Link>
          <Link className="btn btn-primary" href="/admin/events/new">
            New event
          </Link>
        </div>
      </div>
      {!leads.length && (
        <p className="border-t border-brand-sand pt-8">
          No event inquiries yet. Add a phone or email inquiry with “New event.”
        </p>
      )}
      <div className="divide-y divide-brand-sand border-t border-brand-sand">
        {leads.map((m) => (
          <Link
            key={m.id}
            href={`/admin/events/${m.id}`}
            className="block py-6"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-3xl">{m.name} ↗</h2>
              <span className="text-sm">
                {m.reservation_status === "confirmed"
                  ? "Booked"
                  : m.reservation_status === "held"
                    ? "Held"
                    : eventStages[m.event_stage]}
              </span>
            </div>
            <p className="mt-2">
              {eventTypes[m.event_type as keyof typeof eventTypes]} ·{" "}
              {m.event_date || m.date_flexibility} · {m.guests} event guests
            </p>
            <p className="text-sm mt-2 text-brand-stone">
              {m.assigned_to ? `Handled by ${m.assigned_to}` : "Unassigned"}
              {m.follow_up_on ? ` · Follow up ${m.follow_up_on}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
