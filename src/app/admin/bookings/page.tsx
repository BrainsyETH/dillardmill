import Link from 'next/link';
import { listBookings, type BookingRow } from '@/lib/db/bookings';
import { expireRequests } from '@/lib/booking/service';
import { formatCents } from '@/lib/booking/pricing';
import { BookingActions } from '@/components/admin/BookingActions';

export const metadata = { title: 'Bookings | Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<string, string> = {
  requested: 'bg-amber-100 text-amber-900',
  confirmed: 'bg-green-100 text-green-900',
  declined: 'bg-gray-100 text-gray-700',
  expired: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-900',
  failed: 'bg-gray-100 text-gray-500',
  pending_payment: 'bg-blue-100 text-blue-900',
  completed: 'bg-gray-100 text-gray-700',
};

const day = (d: string | Date) => {
  const iso = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
  const [y, m, dd] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
};

function timeLeft(expires: string | null) {
  if (!expires) return null;
  const ms = new Date(expires).getTime() - Date.now();
  if (ms <= 0) return 'expiring now';
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  return `${h}h ${m}m left to respond`;
}

function BookingCard({ b, focus }: { b: BookingRow; focus: boolean }) {
  const q = b.quote;
  return (
    <div className={`bg-white rounded-xl shadow p-5 space-y-3 ${focus ? 'ring-2 ring-[#9C5A3C]' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-lg font-semibold text-[#3A2A1E]">
            {b.unit_name} · {day(b.check_in)} → {day(b.check_out)}
          </div>
          <div className="text-sm text-[#6F8291]">
            {b.num_nights} nights · {b.num_guests} guests{b.num_pets ? ` · ${b.num_pets} pets` : ''} · {b.confirmation_code}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_STYLE[b.booking_status] ?? ''}`}>
          {b.booking_status.replace('_', ' ')}
          {b.payment_status !== 'pending' ? ` · ${b.payment_status.replace('_', ' ')}` : ''}
        </span>
      </div>
      <div className="text-sm">
        <strong>{b.guest_name}</strong> ·{' '}
        <a className="underline" href={`mailto:${b.guest_email}`}>{b.guest_email}</a>
        {b.guest_phone && <> · <a className="underline" href={`tel:${b.guest_phone}`}>{b.guest_phone}</a></>}
      </div>
      {b.special_requests && (
        <p className="text-sm bg-[#F4F1EB] rounded p-2 whitespace-pre-wrap">{b.special_requests}</p>
      )}
      <div className="text-sm text-[#3A2A1E]">
        Total <strong>{formatCents(b.total_amount)}</strong>
        {q && (
          <span className="text-[#6F8291]">
            {' '}(lodging {formatCents(q.lodgingCents)}
            {q.extraGuestCents ? `, extra guests ${formatCents(q.extraGuestCents)}` : ''}
            {q.petCents ? `, pets ${formatCents(q.petCents)}` : ''}
            {q.cleaningCents ? `, cleaning ${formatCents(q.cleaningCents)}` : ''}
            {q.taxCents ? `, tax ${formatCents(q.taxCents)}` : ''})
          </span>
        )}
        {b.refunded_amount > 0 && <span className="text-red-700"> · refunded {formatCents(b.refunded_amount)}</span>}
      </div>
      {b.booking_status === 'requested' && (
        <p className="text-sm text-amber-800">
          {timeLeft(b.expires_at)} — check the Airbnb calendar for these dates before approving.
        </p>
      )}
      {b.decision_note && <p className="text-sm text-[#6F8291]">Note: {b.decision_note}</p>}
      <BookingActions id={b.id} status={b.booking_status} refundableCents={b.total_amount - b.refunded_amount} />
    </div>
  );
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; focus?: string }>;
}) {
  const { view = 'action', focus } = await searchParams;
  // Opportunistic: release overdue requests even if the cron is behind.
  await expireRequests().catch((e) => console.error('expireRequests failed', e));

  const scope = (['action', 'upcoming', 'past', 'all'] as const).find((s) => s === view) ?? 'action';
  const [bookings, pending] = await Promise.all([listBookings(scope), listBookings('action')]);

  const tabs = [
    { key: 'action', label: `Needs response (${pending.length})` },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All activity' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      <div className="bg-[#3A2A1E] text-white py-6 mb-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="text-[#CBB8A3] hover:text-[#F4F1EB] text-sm">← Dashboard</Link>
          <h1 className="text-3xl font-bold mt-1">Bookings</h1>
          <p className="text-[#CBB8A3] mt-1">
            Requests hold the dates and authorize the guest&apos;s card. Approving charges it; declining releases it.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-12 space-y-4">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/bookings?view=${t.key}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                scope === t.key ? 'bg-[#3A2A1E] text-white' : 'bg-white text-[#3A2A1E]'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-[#6F8291]">Nothing here.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {bookings.map((b) => (
              <BookingCard key={b.id} b={b} focus={b.id === focus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
