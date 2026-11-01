import Link from "next/link";
import { headers } from "next/headers";
import { getAllBookableUnits, CALENDAR_SOURCES } from "@/lib/booking/units";
import { getSyncStatus, type SyncStatusRow } from "@/lib/calendar/sync";
import { getUnavailableRanges, listBlocks } from "@/lib/db/availability";
import { addDays, todayAtProperty } from "@/lib/booking/dates";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  BlockForm,
  CopyField,
  DeleteBlockButton,
  SyncNowButton,
} from "@/components/admin/CalendarTools";

export const metadata = {
  title: "Calendars | Admin",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

const PLATFORM: Record<string, string> = {
  airbnb: "Airbnb",
  hipcamp: "Hipcamp",
  vrbo: "VRBO",
};

function ago(ts: string | null) {
  if (!ts) return "";
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 120) return `${mins} min ago`;
  if (mins < 48 * 60) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} days ago`;
}

/** Honest status for one connected calendar link. */
function ImportStatus({ s }: { s?: SyncStatusRow }) {
  if (!s?.last_success_at) {
    return s?.last_error ? (
      <span className="text-red-800">
        Never imported — failing: {s.last_error}
      </span>
    ) : (
      <span className="text-amber-800">Not synced yet</span>
    );
  }
  if (s.last_error) {
    return (
      <span className="text-red-800">
        Failing: {s.last_error}. Last good import {ago(s.last_success_at)}.
      </span>
    );
  }
  return (
    <span className="text-green-900">
      Imported {ago(s.last_success_at)} · {s.event_count ?? 0} entries
    </span>
  );
}

function rangeLabel(r: { source: string; kind?: string }) {
  if (r.source === "direct") return "Website booking";
  if (r.source === "block") return "Blocked here";
  return `${PLATFORM[r.source] ?? r.source} ${r.kind === "block" ? "block" : "reservation"}`;
}

export default async function CalendarAdminPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  const token = process.env.CALENDAR_FEED_TOKEN;
  const exportEnabled = process.env.CALENDAR_EXPORT_ENABLED === "true";

  const today = todayAtProperty();
  const [units, status, blocks] = await Promise.all([
    getAllBookableUnits(),
    getSyncStatus(),
    listBlocks(),
  ]);
  const ranges = await Promise.all(
    units.map((u) => getUnavailableRanges(u._id, today, addDays(today, 120))),
  );
  const anyConnected = units.some((u) =>
    CALENDAR_SOURCES.some((p) => u.icalUrls[p]),
  );

  const feedUrl = (slug: string, channel: string) => {
    const params = new URLSearchParams();
    if (token) params.set("token", token);
    params.set("for", channel);
    return `${base}/calendar/${slug}.ics?${params}`;
  };

  return (
    <AdminShell
      title="Calendars & blocked dates"
      intro={
        exportEnabled ? (
          "Two-way sync is on: the website imports each connected platform and publishes its own calendar for them to import."
        ) : (
          <>
            Calendars are managed by hand. Block dates here for bookings taken
            elsewhere; after approving a website booking, block those dates on
            each platform yourself. Nothing here is sent to Airbnb or any other
            platform.
          </>
        )
      }
    >
      <section>
        <h2 className="section-title text-2xl">Block dates</h2>
        <p className="text-sm text-brand-stone mt-2 max-w-2xl">
          For bookings taken on other platforms or by phone, maintenance, or
          personal use. Blocked dates can&apos;t be requested on the website.
          {exportEnabled
            ? " They are also included in the calendar links other platforms import."
            : " They are not sent to other platforms."}
        </p>
        <div className="mt-5">
          <BlockForm units={units.map((u) => ({ id: u._id, name: u.name }))} />
        </div>
        {blocks.length > 0 && (
          <ul className="mt-6 divide-y divide-brand-sand max-w-3xl">
            {blocks.map((b) => (
              <li
                key={b.id}
                className="py-3 flex flex-wrap justify-between gap-2"
              >
                <span>
                  <strong>
                    {units.find((u) => u._id === b.unit_id)?.name ?? b.unit_id}
                  </strong>{" "}
                  · {b.start_date} → {b.end_date}
                  {b.note ? (
                    <span className="text-brand-stone"> · {b.note}</span>
                  ) : null}
                </span>
                <DeleteBlockButton id={b.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-brand-sand pt-8 mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="section-title text-2xl">Next 120 days</h2>
          {anyConnected && <SyncNowButton />}
        </div>
        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          {units.map((unit, i) => {
            const connected = CALENDAR_SOURCES.filter((p) => unit.icalUrls[p]);
            return (
              <div key={unit._id}>
                <h3 className="text-xl">{unit.name}</h3>
                <p className="text-sm mt-1">
                  {connected.length === 0 ? (
                    <span className="text-brand-stone">
                      No calendar links — all platforms managed by hand.
                    </span>
                  ) : (
                    connected.map((p) => (
                      <span key={p} className="block">
                        {PLATFORM[p]}:{" "}
                        <ImportStatus
                          s={status.find(
                            (s) => s.unit_id === unit._id && s.source === p,
                          )}
                        />
                      </span>
                    ))
                  )}
                </p>
                {ranges[i].length === 0 ? (
                  <p className="text-sm text-brand-stone mt-2">
                    Nothing booked or blocked.
                  </p>
                ) : (
                  <ul className="mt-2 text-sm divide-y divide-brand-sand">
                    {ranges[i].map((r) => (
                      <li
                        key={`${r.unitId}-${r.source}-${r.ref}`}
                        className="py-1.5 flex justify-between gap-3"
                      >
                        <span>
                          {r.start} → {r.end}
                          {r.unitId !== unit._id && (
                            <span className="text-brand-stone">
                              {" "}
                              · {units.find((u) => u._id === r.unitId)?.name}
                            </span>
                          )}
                        </span>
                        <span className="text-brand-stone">
                          {rangeLabel(r)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {exportEnabled && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-link">
                      Calendar links for platforms to import
                    </summary>
                    <div className="space-y-2 mt-2">
                      {(["airbnb", "hipcamp", "vrbo"] as const).map((p) => (
                        <div key={p}>
                          <span className="field-label">For {PLATFORM[p]}</span>
                          <CopyField value={feedUrl(unit.slug, p)} />
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
        {exportEnabled && !token && (
          <p className="mt-6 text-sm text-red-800">
            Set CALENDAR_FEED_TOKEN so the calendar links above can&apos;t be
            guessed.
          </p>
        )}
      </section>

      <details className="border-t border-brand-sand pt-6 mt-10">
        <summary className="cursor-pointer section-title text-2xl">
          Connecting a platform&apos;s calendar
        </summary>
        <div className="prose-content text-sm mt-4 max-w-2xl">
          <p>
            Optional and read-only. In Airbnb, open the listing → Availability →
            Connect calendars → <em>Export calendar</em>, then paste that link
            into the stay&apos;s calendar link under{" "}
            <Link href="/admin/stays">Stays &amp; pricing</Link>. The website
            then imports that platform&apos;s bookings so guests can&apos;t
            request dates already taken there. It can&apos;t change anything on
            Airbnb.
          </p>
          <p>
            Platforms show two kinds of entries: <strong>reservations</strong>{" "}
            (real guest bookings) and <strong>blocks</strong> (&ldquo;Not
            available&rdquo; — your own blocks, availability rules, or dates the
            platform blocked from another calendar). Both stop guests requesting
            those dates. When you approve a request that overlaps a block,
            you&apos;ll be asked to confirm the block is for that request.
          </p>
          <p>
            Removing a calendar link clears its imported dates; you can choose
            to keep upcoming ones as blocks.
          </p>
        </div>
      </details>
    </AdminShell>
  );
}
