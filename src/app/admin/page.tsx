import Link from "next/link";
export const metadata = { title: "Manage Pine Valley" };
const links = [
  [
    "/admin/bookings",
    "Booking requests",
    "Approve, decline, cancel, and refund stays.",
  ],
  [
    "/admin/inquiries",
    "Guest messages",
    "Read contact messages and stay inquiries, including any whose email notification failed.",
  ],
  [
    "/admin/calendar",
    "Calendars and blocked dates",
    "Review sync status, copy export links, and block dates.",
  ],
  [
    "/admin/stays",
    "Stays & pricing",
    "Nightly prices, seasons, fees, guest limits, and which stays take online requests.",
  ],
  [
    "/admin/settings",
    "Booking settings",
    "Taxes, cancellation policy, house rules, check-in times, and response window.",
  ],
  ["/admin/map", "Property map", "Manage unit locations and landmarks."],
  [
    "https://squareup.com/dashboard",
    "Square",
    "Review transactions and payment status.",
  ],
  [
    "https://resend.com/emails",
    "Email delivery",
    "Check whether booking notifications were delivered.",
  ],
];
export default function Admin() {
  return (
    <div className="page-shell section-space">
      <Link href="/" className="text-link">
        ← Website
      </Link>
      <h1 className="page-title mt-8 mb-10">Manage Pine Valley</h1>
      <div className="grid md:grid-cols-2 gap-x-12">
        {links.map(([href, title, description]) => (
          <Link
            href={href}
            key={href}
            className="border-t border-brand-sand py-7"
          >
            <h2 className="text-3xl mb-3">{title} ↗</h2>
            <p>{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
