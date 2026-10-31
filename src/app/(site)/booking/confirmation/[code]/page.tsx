import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBookingByConfirmation } from '@/lib/db/bookings';
import { formatCents } from '@/lib/booking/pricing';

export const metadata = {
  title: 'Your Booking | Pine Valley',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

const HEADINGS: Record<string, { title: string; body: string; tone: string }> = {
  requested: {
    title: 'Request received',
    body: "Your card has been authorized but not charged. We'll review your request and email you shortly — you're only charged once we confirm.",
    tone: 'bg-amber-50 border-amber-200',
  },
  confirmed: {
    title: 'Your stay is confirmed!',
    body: "We can't wait to host you. Arrival details will come by email before your stay.",
    tone: 'bg-green-50 border-green-200',
  },
  declined: {
    title: "We couldn't confirm this request",
    body: 'The hold on your card was released and you were not charged.',
    tone: 'bg-stone-50 border-stone-200',
  },
  expired: {
    title: 'This request expired',
    body: 'The hold on your card was released and you were not charged.',
    tone: 'bg-stone-50 border-stone-200',
  },
  cancelled: {
    title: 'This booking was cancelled',
    body: 'Any refund has been issued to your original card.',
    tone: 'bg-stone-50 border-stone-200',
  },
};

const pretty = (d: unknown) => {
  const iso = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
  const [y, m, dd] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
};

export default async function ConfirmationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^PV-[A-Z0-9]{8}$/.test(code)) notFound();
  const booking = await getBookingByConfirmation(code);
  if (!booking || !HEADINGS[booking.booking_status]) notFound();
  const h = HEADINGS[booking.booking_status];
  const firstName = booking.guest_name.split(' ')[0];

  return (
    <div className="min-h-screen bg-brand-cream/40 py-12">
      <div className="container mx-auto px-4 max-w-2xl space-y-6">
        <div className={`rounded-2xl border p-8 text-center ${h.tone}`}>
          <h1 className="font-serif text-3xl font-semibold text-brand-forest mb-2">{h.title}</h1>
          <p className="text-brand-charcoal/80">
            {firstName ? `${firstName}, ` : ''}
            {h.body}
          </p>
          <div className="inline-block mt-4 bg-white px-5 py-2 rounded-lg">
            <div className="text-xs text-brand-charcoal/60">Confirmation code</div>
            <div className="text-xl font-mono font-bold">{booking.confirmation_code}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-8 space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-brand-forest">{booking.unit_name}</h2>
          <Detail label="Check-in" value={pretty(booking.check_in)} />
          <Detail label="Check-out" value={pretty(booking.check_out)} />
          <Detail label="Nights" value={String(booking.num_nights)} />
          <Detail
            label="Guests"
            value={`${booking.num_guests}${booking.num_pets ? ` + ${booking.num_pets} pet${booking.num_pets > 1 ? 's' : ''}` : ''}`}
          />
          <Detail
            label={booking.booking_status === 'requested' ? 'Authorized (not charged)' : 'Total'}
            value={formatCents(booking.total_amount)}
          />
          {booking.refunded_amount > 0 && <Detail label="Refunded" value={formatCents(booking.refunded_amount)} />}
        </div>

        <div className="bg-white rounded-2xl shadow p-8 text-sm text-brand-charcoal/80 space-y-1">
          <p className="font-semibold text-brand-forest">Pine Valley at Dillard Mill</p>
          <p>126 Dillard Mill Road, Davisville, MO 65456</p>
          <p>
            Questions? <a className="underline" href="tel:+13148434321">(314) 843-4321</a> ·{' '}
            <a className="underline" href="mailto:pinevalley@dillardmill.com">pinevalley@dillardmill.com</a>
          </p>
        </div>

        <div className="text-center">
          <Link href="/the-area" className="btn btn-outline">Explore the area</Link>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-brand-sand/50 pb-2">
      <span className="text-brand-charcoal/70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
