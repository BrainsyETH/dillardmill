import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require";
import { getEventBlocks, getEventLead } from "@/lib/events/service";
import { eventTypes, packageName } from "@/lib/events/content";
import { EventManager } from "@/components/events/EventManager";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Event inquiry | Pine Valley",
  robots: { index: false },
};
export default async function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const detail = await getEventLead(id);
  if (!detail) notFound();
  const { lead: m, reservations } = detail;
  const active = reservations.find(
    (r) => r.status === "held" || r.status === "confirmed",
  );
  const blocks = active
    ? await getEventBlocks(active.start_date, active.end_date)
    : [];
  return (
    <main className="page-shell py-10">
      <Link href="/admin/events" className="text-link">
        ← Events
      </Link>
      <h1 className="page-title mt-7 mb-4">{m.name}</h1>
      <p>
        <a className="text-link" href={`mailto:${m.email}`}>
          {m.email}
        </a>
        {m.phone && (
          <>
            {" "}
            ·{" "}
            <a className="text-link" href={`tel:${m.phone}`}>
              {m.phone}
            </a>
          </>
        )}
      </p>
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 mt-10">
        <section>
          <h2 className="text-3xl mb-5">The inquiry</h2>
          <dl className="space-y-4">
            {[
              ["Event", eventTypes[m.event_type as keyof typeof eventTypes]],
              ["Date", m.event_date || "Flexible"],
              ["Other dates", m.date_flexibility],
              ["Event guests", String(m.guests)],
              [
                "Overnight guests",
                m.overnight_guests == null
                  ? "Not specified"
                  : String(m.overnight_guests),
              ],
              ["Package", packageName(m.package_id)],
              ["Budget", m.budget],
              ["Heard about us", m.referral_source],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-brand-stone">{label}</dt>
                  <dd className="mt-1">{value}</dd>
                </div>
              ))}
          </dl>
          {m.message && <p className="whitespace-pre-wrap mt-6">{m.message}</p>}
          <p className="text-sm mt-7">
            {m.event_origin === "owner" ? (
              "Added by owner. No emails sent."
            ) : (
              <>
                Guest receipt: {m.guest_notified ? "Sent" : "Not sent"} · Owner
                notification: {m.owner_notified ? "Sent" : "Not sent"}
              </>
            )}
          </p>
          {reservations.length > 0 && (
            <details className="mt-7">
              <summary>Reservation history</summary>
              <ul className="text-sm space-y-3 mt-4">
                {reservations.map((r) => (
                  <li key={r.id}>
                    {r.start_date} → {r.end_date} · {r.status}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
        <EventManager
          key={`${active?.id || "none"}-${active?.status || ""}`}
          lead={m}
          active={active}
          blocks={blocks}
        />
      </div>
    </main>
  );
}
