import Link from "next/link";
import { GuestMessageForm } from "@/components/forms/GuestMessageForm";
import { getAllUnits } from "@/lib/sanity/queries";
export const metadata = { title: "Plan your stay | Pine Valley" };
export default async function Inquiry({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, units] = await Promise.all([searchParams, getAllUnits()]);
  const str = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const selected = units.find((u) => u.slug.current === str("unit"));
  return (
    <div className="page-shell section-space grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-24">
      <div>
        <p className="eyebrow mb-4">Plan it with us</p>
        <h1 className="page-title mb-7">
          {selected?.slug.current === "book-the-farm"
            ? "Everyone, together."
            : "Tell us what you have in mind."}
        </h1>
        <p className="text-lg leading-relaxed">
          {selected
            ? `Ask about ${selected.name}, your dates, and the people coming with you.`
            : "Let us know your dates and group size. We’ll help you find the right stay."}{" "}
          We’ll reply with availability and a quote.
        </p>
        <p className="mt-5 text-brand-stone">
          There’s no payment at this stage. Dates are reserved only after we
          agree on the details.
        </p>
        <Link href="/contact" className="text-link inline-block mt-8">
          Prefer to call? Get in touch ↗
        </Link>
      </div>
      <GuestMessageForm
        kind="inquiry"
        unitSlug={selected?.slug.current}
        initialCheckIn={str("checkIn")}
        initialCheckOut={str("checkOut")}
        initialGuests={str("guests")}
        units={units.map((u) => ({ slug: u.slug.current, name: u.name }))}
      />
    </div>
  );
}
