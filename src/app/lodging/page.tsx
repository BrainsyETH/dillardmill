import Link from 'next/link';
import { getAllUnits } from '@/lib/sanity/queries';
import { UnitCard } from '@/components/units/UnitCard';

export const metadata = {
  title: 'Lodging | Pine Valley',
  description: 'Browse our unique rental units including vintage Airstreams, cozy cottages, and event spaces in Missouri\'s Mark Twain National Forest.',
};

export default async function UnitsPage() {
  const units = await getAllUnits();

  // Separate featured and regular units
  const featuredUnits = units.filter(unit => unit.featured);
  const regularUnits = units.filter(unit => !unit.featured);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#3A2A1E] mb-4">
          Our Lodging
        </h1>
        <p className="text-xl text-[#6F8291]">
          From vintage Airstreams to cozy cottages, find your perfect retreat at Pine Valley.
          Each unit offers a unique experience while surrounded by the beauty of Mark Twain National Forest.
        </p>
      </div>

      {units.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-[#6F8291] mb-6">
            Our accommodations are being prepared. Check back soon!
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#9C5A3C] text-[#F4F1EB] px-8 py-3 rounded-lg font-semibold hover:bg-[#7D4830] transition-colors"
          >
            Contact Us for Availability
          </Link>
        </div>
      ) : (
        <>
          {/* Featured Units - Large Display */}
          {featuredUnits.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-[#CBB8A3] to-transparent flex-1"></div>
                <h2 className="text-2xl font-bold text-[#3A2A1E] px-4">Featured Property</h2>
                <div className="h-px bg-gradient-to-r from-transparent via-[#CBB8A3] to-transparent flex-1"></div>
              </div>
              {featuredUnits.map((unit) => (
                <UnitCard key={unit._id} unit={unit} featured={true} />
              ))}
            </div>
          )}

          {/* Regular Units Grid */}
          {regularUnits.length > 0 && (
            <>
              {featuredUnits.length > 0 && (
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-[#CBB8A3] to-transparent flex-1"></div>
                  <h2 className="text-xl font-semibold text-[#6B7A5A] px-4">More Accommodations</h2>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#CBB8A3] to-transparent flex-1"></div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularUnits.map((unit) => (
                  <UnitCard key={unit._id} unit={unit} featured={false} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-16 bg-gradient-to-br from-[#F4F1EB] to-[#CBB8A3] border-2 border-[#CBB8A3] rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-[#3A2A1E] mb-4">Ready to Book?</h2>
        <p className="text-[#2B2B2B] mb-6">
          Reserve your stay through Airbnb or Hipcamp, or contact us directly for group bookings and special arrangements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://www.airbnb.com/users/show/309588444"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-[#9C5A3C] to-[#7D4830] text-[#F4F1EB] px-8 py-3 rounded-lg font-semibold hover:from-[#7D4830] hover:to-[#6B3825] transition-all shadow-lg"
          >
            View on Airbnb
          </a>
          <a
            href="https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-[#3A2A1E] text-[#3A2A1E] px-8 py-3 rounded-lg font-semibold hover:bg-[#3A2A1E] hover:text-[#F4F1EB] transition-colors"
          >
            View on Hipcamp
          </a>
        </div>
      </div>
    </div>
  );
}
