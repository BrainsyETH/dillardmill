import Link from "next/link";
import { listBookings, type BookingRow } from "@/lib/db/bookings";
import { expireRequests } from "@/lib/booking/service";
import { formatCents } from "@/lib/booking/pricing";
import { BookingActions } from "@/components/admin/BookingActions";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Bookings | Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  requested: "Needs your response",
  confirmed: "Confirmed",
  declined: "Declined",
  expired: "Expired",
  cancelled: "Cancelled",
  failed: "Card not authorized",
  pending_payment: "Authorizing card",
  completed: "Completed",
};

const day = (d: string | Date) => {
  const iso =
    d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
  const [y, m, dd] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

function timeLeft(expires: string | null) {
  if (!expires) return null;
  const ms = new Date(expires).getTime() - Date.now();
  if (ms <= 0) return "expiring now";
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  return `${h}h ${m}m left to respond`;
}

function BookingCard({ b, focus }: { b: BookingRow; focus: boolean }) {
  const q = b.quote;
  return (
    <article
      className={`border-t pt-5 space-y-3 ${focus ? "border-brand-copper border-t-2" : "border-brand-sand"}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl">
          {b.unit_name}
          <span className="text-brand-stone text-lg">
            {" "}
            · {day(b.check_in)} → {day(b.check_out)}
          </span>
        </h2>
        <span
          className={`text-sm font-semibold ${b.booking_status === "requested" ? "text-brand-copper" : "text-brand-stone"}`}
        >
          {STATUS_LABEL[b.booking_status] ?? b.booking_status}
          {b.payment_status === "paid" ? " · paid" : ""}
          {b.payment_status === "refunded" ? " · refunded" : ""}
          {b.payment_status === "partially_refunded"
            ? " · partly refunded"
            : ""}
        </span>
      </div>
      <p className="text-sm text-brand-stone">
        {b.num_nights} nights · {b.num_guests} guests
        {b.num_pets ? ` · ${b.num_pets} pets` : ""} · {b.confirmation_code}
      </p>
      <p>
        <strong>{b.guest_name}</strong> ·{" "}
        <a className="text-link" href={`mailto:${b.guest_email}`}>
          {b.guest_email}
        </a>
        {b.guest_phone && (
          <>
            {" "}
            ·{" "}
            <a className="text-link" href={`tel:${b.guest_phone}`}>
              {b.guest_phone}
            </a>
          </>
        )}
      </p>
      {b.special_requests && (
        <blockquote className="border-l-2 border-brand-sand pl-3 whitespace-pre-wrap">
          {b.special_requests}
        </blockquote>
      )}
      <p className="text-sm">
        Total <strong>{formatCents(b.total_amount)}</strong>
        {q && (
          <span className="text-brand-stone">
            {" "}
            (lodging {formatCents(q.lodgingCents)}
            {q.extraGuestCents
              ? `, extra guests ${formatCents(q.extraGuestCents)}`
              : ""}
            {q.petCents ? `, pets ${formatCents(q.petCents)}` : ""}
            {q.cleaningCents
              ? `, cleaning ${formatCents(q.cleaningCents)}`
              : ""}
            {q.taxCents ? `, tax ${formatCents(q.taxCents)}` : ""})
          </span>
        )}
        {b.refunded_amount > 0 && (
          <span className="text-red-800">
            {" "}
            · refunded {formatCents(b.refunded_amount)}
          </span>
        )}
      </p>
      {b.booking_status === "requested" && (
        <p className="text-sm">
          <strong>{timeLeft(b.expires_at)}.</strong> Check these dates on the
          other platforms listing this stay before approving.
        </p>
      )}
      {b.decision_note && (
        <p className="text-sm text-brand-stone">Note: {b.decision_note}</p>
      )}
      <BookingActions
        id={b.id}
        status={b.booking_status}
        refundableCents={b.total_amount - b.refunded_amount}
      />
    </article>
  );
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; focus?: string }>;
}) {
  const { view = "action", focus } = await searchParams;
  // Opportunistic: release overdue requests even if the cron is behind.
  await expireRequests().catch((e) =>
    console.error("expireRequests failed", e),
  );

  const scope =
    (["action", "upcoming", "past", "all"] as const).find((s) => s === view) ??
    "action";
  const [bookings, pending] = await Promise.all([
    listBookings(scope),
    listBookings("action"),
  ]);

  const tabs = [
    { key: "action", label: `Needs response (${pending.length})` },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All activity" },
  ];

  return (
    <AdminShell
      title="Booking requests"
      intro="A request holds the dates and places a hold on the guest's card. Approving charges the card; declining releases it."
    >
      <nav
        className="flex flex-wrap gap-x-6 gap-y-2 mb-8"
        aria-label="Booking views"
      >
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/bookings?view=${t.key}`}
            aria-current={scope === t.key ? "page" : undefined}
            className={
              scope === t.key
                ? "font-semibold border-b-2 border-brand-forest"
                : "text-link"
            }
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {bookings.length === 0 ? (
        <p className="text-brand-stone">Nothing here.</p>
      ) : (
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
          {bookings.map((b) => (
            <BookingCard key={b.id} b={b} focus={b.id === focus} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
