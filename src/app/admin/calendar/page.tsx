import Link from 'next/link';
import { headers } from 'next/headers';
import { getAllBookableUnits, CALENDAR_SOURCES } from '@/lib/booking/units';
import { getSyncStatus } from '@/lib/calendar/sync';
import { getUnavailableRanges, listBlocks } from '@/lib/db/availability';
import { addDays, todayAtProperty } from '@/lib/booking/dates';
import { BlockForm, CopyField, DeleteBlockButton, SyncNowButton } from '@/components/admin/CalendarTools';

export const metadata = { title: 'Calendars | Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

const SOURCE_LABEL: Record<string, string> = {
  direct: 'Website',
  block: 'Blocked',
  airbnb: 'Airbnb',
  hipcamp: 'Hipcamp',
  vrbo: 'VRBO',
};

function ago(ts: string | null) {
  if (!ts) return 'never';
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 120) return `${mins} min ago`;
  return `${Math.round(mins / 60)} h ago`;
}

export default async function CalendarAdminPage() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const base = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  const token = process.env.CALENDAR_FEED_TOKEN;

  const today = todayAtProperty();
  const [units, status, blocks] = await Promise.all([getAllBookableUnits(), getSyncStatus(), listBlocks()]);
  const ranges = await Promise.all(units.map((u) => getUnavailableRanges(u._id, today, addDays(today, 120))));

  const feedUrl = (slug: string, channel: string) => {
    const params = new URLSearchParams();
    if (token) params.set('token', token);
    params.set('for', channel);
    return `${base}/calendar/${slug}.ics?${params}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      <div className="bg-[#3A2A1E] text-white py-6 mb-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="text-[#CBB8A3] hover:text-[#F4F1EB] text-sm">← Dashboard</Link>
          <h1 className="text-3xl font-bold mt-1">Calendars &amp; Airbnb sync</h1>
          <p className="text-[#CBB8A3] mt-1">
            Imports run every 15 minutes and whenever a guest opens a calendar or sends a request.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 space-y-6">
        <div className="bg-white rounded-xl shadow p-5 flex flex-wrap items-center justify-between gap-4">
          <SyncNowButton />
          {!token && (
            <p className="text-sm text-amber-800">
              Set CALENDAR_FEED_TOKEN so your outbound calendar links can&apos;t be guessed.
            </p>
          )}
        </div>

        <details className="bg-white rounded-xl shadow p-5">
          <summary className="font-semibold cursor-pointer">How to connect Airbnb (do this once per listing)</summary>
          <ol className="list-decimal ml-5 mt-3 space-y-2 text-sm">
            <li>
              <strong>Airbnb → website:</strong> In Airbnb, open the listing → Availability → Connect calendars →
              <em> Export calendar</em>. Copy that link into the listing&apos;s <em>Airbnb iCal URL</em> field in the
              Content Studio.
            </li>
            <li>
              <strong>Website → Airbnb:</strong> In the same Airbnb screen choose <em>Import calendar</em>, paste the
              &ldquo;for Airbnb&rdquo; link shown below for that stay, and name it &ldquo;Pine Valley website&rdquo;.
            </li>
            <li>
              Airbnb refreshes imported calendars on its own schedule (usually every few hours). Because website
              bookings are requests, always glance at the Airbnb calendar before approving.
            </li>
          </ol>
        </details>

        {units.map((unit, i) => {
          const unitStatus = status.filter((s) => s.unit_id === unit._id);
          return (
            <section key={unit._id} className="bg-white rounded-xl shadow p-5 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold text-[#3A2A1E]">{unit.name}</h2>
                {!unit.directBookingEnabled && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Online requests off</span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {CALENDAR_SOURCES.map((source) => {
                  const s = unitStatus.find((x) => x.source === source);
                  const configured = Boolean(unit.icalUrls[source]);
                  return (
                    <div key={source} className="rounded-lg border border-[#CBB8A3] p-3 text-sm">
                      <div className="font-semibold">{SOURCE_LABEL[source]} import</div>
                      {!configured ? (
                        <div className="text-[#6F8291]">Not connected</div>
                      ) : s?.last_error ? (
                        <div className="text-red-700">
                          Failing: {s.last_error}
                          <br />
                          Last good sync {ago(s.last_success_at)}
                        </div>
                      ) : (
                        <div className="text-green-800">
                          OK · {s?.event_count ?? 0} events · {ago(s?.last_success_at ?? null)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Paste into Airbnb → Import calendar</div>
                <CopyField value={feedUrl(unit.slug, 'airbnb')} />
                <details className="text-sm">
                  <summary className="cursor-pointer text-[#6F8291]">Links for Hipcamp / VRBO</summary>
                  <div className="space-y-2 mt-2">
                    <CopyField value={feedUrl(unit.slug, 'hipcamp')} />
                    <CopyField value={feedUrl(unit.slug, 'vrbo')} />
                  </div>
                </details>
              </div>

              <div>
                <div className="text-sm font-semibold mb-1">Next 120 days</div>
                {ranges[i].length === 0 ? (
                  <p className="text-sm text-[#6F8291]">Wide open.</p>
                ) : (
                  <ul className="text-sm divide-y divide-[#F4F1EB]">
                    {ranges[i].map((r) => (
                      <li key={`${r.source}-${r.ref}`} className="py-1 flex justify-between gap-2">
                        <span>
                          {r.start} → {r.end}
                          {r.label && r.source === 'block' ? ` · ${r.label}` : ''}
                        </span>
                        <span className="text-[#6F8291]">{SOURCE_LABEL[r.source]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}

        <section className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="text-xl font-semibold text-[#3A2A1E]">Block dates</h2>
          <p className="text-sm text-[#6F8291]">
            For maintenance, personal use, or bookings taken by phone. Blocks appear on the website calendar and are
            sent to Airbnb through the import link above.
          </p>
          <BlockForm units={units.map((u) => ({ id: u._id, name: u.name }))} />
          {blocks.length > 0 && (
            <ul className="text-sm divide-y divide-[#F4F1EB]">
              {blocks.map((b) => (
                <li key={b.id} className="py-2 flex justify-between gap-2">
                  <span>
                    {units.find((u) => u._id === b.unit_id)?.name ?? b.unit_id}: {b.start_date} → {b.end_date}
                    {b.note ? ` · ${b.note}` : ''}
                  </span>
                  <DeleteBlockButton id={b.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
