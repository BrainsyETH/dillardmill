import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUnitBySlug } from '@/lib/sanity/queries';
import { UnitDetail } from '@/components/units/UnitDetail';
import { generateVacationRentalSchema, generateJsonLdScript } from '@/lib/schema';

export const metadata = {
  title: 'Tiny Cabin #1 | Pine Valley',
  description: 'Stay in Tiny Cabin #1 at Pine Valley near Dillard Mill. Queen bed, AC, perfect for couples. Missouri Ozarks getaway.',
};

export default async function TinyCabin1Page() {
  const unit = await getUnitBySlug('tiny-cabin-1');

  if (!unit || !unit.available) {
    notFound();
  }

  const rentalSchema = generateVacationRentalSchema(unit);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLdScript(rentalSchema)}
      />

      <div className="min-h-screen">
      <div className="bg-[#F4F1EB] border-b border-[#CBB8A3]">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-[#6F8291]">
            <Link href="/" className="hover:text-[#3A2A1E]">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/lodging" className="hover:text-[#3A2A1E]">Lodging</Link>
            <span className="mx-2">/</span>
            <span className="text-[#3A2A1E] font-medium">{unit.name}</span>
          </nav>
        </div>
      </div>

      <UnitDetail unit={unit} />

      <div className="bg-[#F4F1EB] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#3A2A1E] mb-4">More Accommodations</h2>
            <Link
              href="/lodging"
              className="inline-block text-[#9C5A3C] font-semibold hover:text-[#7D4830]"
            >
              View All Lodging →
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
