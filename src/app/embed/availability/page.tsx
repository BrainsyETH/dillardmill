import Link from 'next/link';
import { getUnitBySlug } from '@/lib/sanity/queries';
import { AvailabilityCalendar } from '@/components/booking/AvailabilityCalendar';
import { PricingDisplay } from '@/components/units/PricingDisplay';

interface EmbedAvailabilityProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmbedAvailability({ searchParams }: EmbedAvailabilityProps) {
  const params = (await searchParams) ?? {};
  const slugParam = params.unit;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!slug) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6 text-center text-gray-600">
        <div>
          <p className="font-semibold">Missing unit.</p>
          <p className="text-sm mt-1">
            Add <code>?unit=&lt;slug&gt;</code> to the URL.
          </p>
        </div>
      </div>
    );
  }

  const unit = await getUnitBySlug(slug);

  if (!unit) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6 text-center text-gray-600">
        <p>Unit not found.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-white">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <header className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-stone-800">{unit.name}</h1>
          {unit.shortDescription && (
            <p className="text-sm text-gray-600 mt-1">{unit.shortDescription}</p>
          )}
        </header>

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Availability</h2>
            <AvailabilityCalendar unitId={unit._id} numberOfMonths={2} />
          </section>

          <aside className="space-y-4">
            <PricingDisplay unit={unit} />
            <Link
              href={`/lodging/${unit.slug.current}`}
              target="_top"
              className="block w-full text-center bg-stone-800 text-white font-semibold py-3 rounded-lg hover:bg-stone-700 transition"
            >
              Book on dillardmill.com
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
