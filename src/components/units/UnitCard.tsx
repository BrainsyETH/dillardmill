import Image from "next/image";
import Link from "next/link";
import type { RentalUnit } from "@/lib/stays/types";
import {
  unitPhotos,
  stayDetails,
  sleepingArrangement,
} from "@/lib/content/property";
import { getUnitUrl } from "@/lib/utils/slugToUrl";
import { formatCents, type Quote } from "@/lib/booking/pricing";

export function UnitCard({
  unit,
  searchQuery,
  quote,
  notice,
}: {
  unit: RentalUnit;
  searchQuery?: string;
  quote?: Quote;
  notice?: string;
}) {
  const image = unitPhotos(unit)[0];
  const href = `${getUnitUrl(unit.slug.current)}${searchQuery ? `?${searchQuery}` : ""}`;
  return (
    <article className="flex flex-col">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/3] bg-brand-sand overflow-hidden"
      >
        {image && (
          <Image
            src={image.src}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 33vw"
            className="object-cover"
          />
        )}
      </Link>
      <div className="pt-5 flex flex-col flex-1">
        <p className="text-xs uppercase tracking-widest text-brand-stone mb-2">
          Sleeps {unit.maxGuests} · {sleepingArrangement(unit)}
        </p>
        <h3 className="text-3xl">
          <Link href={href} className="hover:underline underline-offset-4">
            {unit.name}
          </Link>
        </h3>
        <p className="text-sm mt-2 text-brand-stone">
          {stayDetails(unit.slug.current)?.bath ||
            `${unit.bathrooms} bathroom${unit.bathrooms === 1 ? "" : "s"}`}
        </p>
        <p className="mt-4 leading-relaxed text-brand-charcoal">
          {unit.shortDescription}
        </p>
        <div className="pt-5 mt-auto">
          <p className="text-sm mb-3">
            {quote ? (
              <>
                <strong>{formatCents(quote.totalCents)} total</strong> ·{" "}
                {quote.numNights} nights, including fees and taxes
              </>
            ) : (
              notice ||
              (unit.basePrice > 0
                ? `From ${formatCents(unit.basePrice * 100)} / night · fees and tax at checkout`
                : "Ask us about dates and rates")
            )}
          </p>
          <Link href={href} className="text-link">
            View {unit.name.replace(/^The /, "")}{" "}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
