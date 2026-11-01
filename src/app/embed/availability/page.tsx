import Link from "next/link";
import { getUnitBySlug } from "@/lib/sanity/queries";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { getUnitUrl } from "@/lib/utils/slugToUrl";
export const metadata = {
  title: "Stay availability | Pine Valley",
  robots: { index: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const { unit: slug } = await searchParams;
  const unit = slug ? await getUnitBySlug(slug) : null;
  if (!unit)
    return (
      <div className="p-6">
        <h1 className="text-2xl">Choose a stay</h1>
        <p className="mt-3">
          <Link className="text-link" href="/lodging" target="_top">
            See Pine Valley stays ↗
          </Link>
        </p>
      </div>
    );
  return (
    <div className="p-5 max-w-md mx-auto">
      <p className="eyebrow mb-3">Pine Valley at Dillard Mill</p>
      <h1 className="text-3xl mb-4">{unit.name}</h1>
      {unit.directBookingEnabled === false ? (
        <>
          <p className="mb-4">
            Contact your hosts for availability and a quote.
          </p>
          <a
            className="btn btn-primary"
            href={`${getUnitUrl(slug!)}#stay-request`}
            target="_top"
          >
            Ask about dates
          </a>
        </>
      ) : (
        <AvailabilityCalendar unitSlug={slug!} minStay={unit.minStay} />
      )}
    </div>
  );
}
