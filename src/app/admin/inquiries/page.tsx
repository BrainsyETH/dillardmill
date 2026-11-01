import Link from "next/link";
import { sql } from "@/lib/db/client";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Guest messages | Pine Valley",
  robots: { index: false },
};

export default async function InquiriesPage() {
  const messages =
    await sql`SELECT *, check_in::text AS arrival, check_out::text AS departure FROM guest_messages ORDER BY created_at DESC LIMIT 200`;
  return (
    <div className="page-shell py-12">
      <Link href="/admin" className="text-link">
        ← Dashboard
      </Link>
      <h1 className="page-title mt-6">Guest messages</h1>
      <div className="mt-10 divide-y divide-brand-sand">
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((m) => (
            <article key={String(m.id)} className="py-6 space-y-3">
              <div className="flex flex-wrap justify-between gap-2">
                <h2 className="text-2xl">
                  {String(m.name)}
                  {m.kind === "event" && (
                    <>
                      {" "}
                      ·{" "}
                      <Link
                        className="text-link text-base"
                        href={`/admin/events/${m.id}`}
                      >
                        Event inquiry ↗
                      </Link>
                    </>
                  )}
                </h2>
                <time className="text-sm text-brand-stone">
                  {new Date(String(m.created_at)).toLocaleString("en-US", {
                    timeZone: "America/Chicago",
                  })}{" "}
                  CT
                </time>
              </div>
              <p>
                <a className="text-link" href={`mailto:${m.email}`}>
                  {String(m.email)}
                </a>
                {m.phone ? (
                  <>
                    {" "}
                    ·{" "}
                    <a className="text-link" href={`tel:${m.phone}`}>
                      {String(m.phone)}
                    </a>
                  </>
                ) : null}
              </p>
              {m.unit_slug || m.guests || m.arrival ? (
                <p>
                  {m.unit_slug
                    ? String(m.unit_slug).replaceAll("-", " ")
                    : "Stay inquiry"}
                  {m.guests ? ` · ${m.guests} guests` : ""}
                  {m.arrival ? ` · ${m.arrival} to ${m.departure}` : ""}
                </p>
              ) : null}
              <p className="whitespace-pre-wrap">{String(m.message)}</p>
              {!m.owner_notified && m.event_origin !== "owner" && (
                <p className="text-sm text-amber-900">
                  Email notification was not delivered. This message is saved
                  here.
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
