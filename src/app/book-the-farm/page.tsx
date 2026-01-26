import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUnitBySlug } from '@/lib/sanity/queries';
import { UnitDetail } from '@/components/units/UnitDetail';

export const metadata = {
  title: 'Book the Farm | Pine Valley',
  description: 'Reserve the entire Pine Valley property for your exclusive event or retreat at Dillard Mill.',
};

export default async function BookTheFarmPage() {
  const unit = await getUnitBySlug('book-the-farm');

  if (!unit || !unit.available) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
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

      {/* Related Units */}
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
  );
}
