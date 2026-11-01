import Link from "next/link";
import Image from "next/image";
import { getAllUnits } from "@/lib/sanity/queries";
import { UnitCard } from "@/components/units/UnitCard";
import AvailabilitySearch from "@/components/booking/AvailabilitySearch";
import { getAllBookableUnits, getBookingSettings } from "@/lib/booking/units";
import { conflictingUnits } from "@/lib/booking/inventory";
import { syncUnitIfStale } from "@/lib/calendar/sync";
import { isRangeFree } from "@/lib/db/availability";
import { quoteStay, type Quote } from "@/lib/booking/pricing";
import { todayAtProperty } from "@/lib/booking/dates";
import { matchesStay, parseStaySearch } from "@/lib/booking/search";
import { photo } from "@/lib/content/property";
export const metadata = {
  title: "Find your stay | Pine Valley at Dillard Mill",
  description:
    "Compare the cottage and vintage trailers at Pine Valley. Find the right beds, bathrooms, and dates for your group.",
};
export const dynamic = "force-dynamic";
export default async function Lodging({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [all, raw] = await Promise.all([getAllUnits(), searchParams]);
  const params = Object.fromEntries(
    ["checkIn", "checkOut", "guests", "pets"].map((k) => [
      k,
      typeof raw[k] === "string" ? (raw[k] as string) : "",
    ]),
  );
  const search = parseStaySearch(params);
  const candidates = search.error
    ? []
    : all.filter((u) => matchesStay(u, search));
  const results = new Map<
    string,
    { available?: boolean; quote?: Quote; notice?: string }
  >();
  if (search.hasDates && !search.error) {
    try {
      const [bookable, settings] = await Promise.all([
        getAllBookableUnits(),
        getBookingSettings(),
      ]);
      const inventory = [
        ...new Map(
          candidates
            .flatMap((u) => {
              const unit = bookable.find((b) => b._id === u._id);
              return unit ? conflictingUnits(unit, bookable) : [];
            })
            .map((u) => [u._id, u]),
        ).values(),
      ];
      await Promise.all(inventory.map((u) => syncUnitIfStale(u, 15)));
      await Promise.all(
        candidates.map(async (u) => {
          const unit = bookable.find((b) => b._id === u._id);
          if (!unit?.directBookingEnabled) {
            results.set(u._id, {
              notice: "Ask us to confirm availability and a quote",
            });
            return;
          }
          const priced = quoteStay(
            unit,
            {
              checkIn: params.checkIn,
              checkOut: params.checkOut,
              guests: search.guests,
              pets: search.pets,
            },
            settings.taxRates,
            todayAtProperty(),
          );
          if (!priced.ok) {
            results.set(u._id, { notice: priced.error });
            return;
          }
          try {
            results.set(u._id, {
              available: await isRangeFree(
                u._id,
                params.checkIn,
                params.checkOut,
                conflictingUnits(unit, bookable).map((i) => i._id),
              ),
              quote: priced.quote,
            });
          } catch {
            results.set(u._id, {
              notice: "Ask us to confirm availability for these dates",
            });
          }
        }),
      );
    } catch {
      for (const u of candidates)
        results.set(u._id, {
          notice: "Ask us to confirm availability and a quote",
        });
    }
  }
  const visible = candidates.filter(
    (u) => results.get(u._id)?.available !== false,
  );
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v),
  ).toString();
  const farmPhoto = photo("bb46c51f3e11");
  return (
    <div className="page-shell section-space">
      <p className="eyebrow mb-4">Find your place at Pine Valley</p>
      <div className="grid md:grid-cols-2 gap-6 items-end">
        <h1 className="page-title">The stays.</h1>
        <p className="text-lg leading-relaxed max-w-lg">
          A cottage and vintage trailers, each with its own character. Start
          with the people coming along, then choose your dates.
        </p>
      </div>
      <AvailabilitySearch initial={params} />
      {search.error ? (
        <p role="alert" className="text-red-800 mb-8">
          {search.error}
        </p>
      ) : (
        <p className="text-sm text-brand-stone mb-8" aria-live="polite">
          {visible.length} {visible.length === 1 ? "stay fits" : "stays fit"}{" "}
          your search
          {search.hasDates
            ? ` · ${search.nights} nights · ${search.guests} guests`
            : ""}
          . {search.hasDates && "Requests are confirmed by your hosts."}
        </p>
      )}
      {!!visible.length && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-14">
          {visible.map((u) => (
            <UnitCard
              key={u._id}
              unit={u}
              searchQuery={query}
              quote={results.get(u._id)?.quote}
              notice={results.get(u._id)?.notice}
            />
          ))}
        </div>
      )}
      {!visible.length && !search.error && (
        <div className="py-8 max-w-xl">
          <h2 className="text-3xl mb-4">Let’s find another way.</h2>
          <p className="leading-relaxed">
            No individual stay fits these dates, group size, pets, and
            minimum-stay rules. Try other dates, or ask us about combining
            stays.
          </p>
          <Link
            href={`/booking-request?${query}`}
            className="text-link inline-block mt-5"
          >
            Ask us to help ↗
          </Link>
        </div>
      )}
      <section className="mt-16 pt-10 border-t border-brand-sand grid md:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div className="relative aspect-[16/10]">
          <Image
            src={farmPhoto.src}
            alt={farmPhoto.alt}
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow mb-4">For the whole group</p>
          <h2 className="section-title mb-5">Book the Farm.</h2>
          <p className="leading-relaxed mb-6">
            Eight accommodations, shared gathering spaces, and room for camping.
            Plan a weekend together with your hosts.
          </p>
          <Link
            href={`/book-the-farm${query ? `?${query}` : ""}`}
            className="text-link"
          >
            See what’s included ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
