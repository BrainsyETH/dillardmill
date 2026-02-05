import Link from 'next/link';
import { getAllUnits } from '@/lib/sanity/queries';
import { UnitCard } from '@/components/units/UnitCard';
import { generateLodgingBusinessSchema, generateJsonLdScript } from '@/lib/schema';

export const metadata = {
  title: 'Lodging | Pine Valley at Dillard Mill',
  description: 'Browse our unique rental units including vintage Airstreams, cozy cottages, and event spaces in Missouri\'s Mark Twain National Forest.',
};

export default async function UnitsPage() {
  const units = await getAllUnits();
  const lodgingSchema = generateLodgingBusinessSchema(units);

  // Separate featured and regular units
  const featuredUnits = units.filter(unit => unit.featured);
  const regularUnits = units.filter(unit => !unit.featured);

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLdScript(lodgingSchema)}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-forest to-brand-forest/90 text-brand-cream py-20 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-copper/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brand-sage/10 to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
                ACCOMMODATIONS
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
                Our Lodging
              </h1>
              <p className="text-xl text-brand-sand/90 leading-relaxed">
                From vintage Airstreams to cozy cottages, find your perfect retreat at Pine Valley.
                Each unit offers a unique experience while surrounded by the beauty of Mark Twain National Forest.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          {units.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-brand-sand/30 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-brand-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-brand-forest mb-4">
                  Accommodations Coming Soon
                </h2>
                <p className="text-brand-stone mb-8">
                  Our accommodations are being prepared. Check back soon or contact us for availability!
                </p>
                <Link
                  href="/contact"
                  className="btn btn-primary"
                >
                  Contact Us for Availability
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Units - Large Display */}
              {featuredUnits.length > 0 && (
                <div className="mb-20">
                  <div className="section-header justify-center mb-12">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-forest px-6">
                      Featured Property
                    </h2>
                  </div>
                  <div className="space-y-8">
                    {featuredUnits.map((unit) => (
                      <UnitCard key={unit._id} unit={unit} featured={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Units Grid */}
              {regularUnits.length > 0 && (
                <>
                  {featuredUnits.length > 0 && (
                    <div className="section-header justify-center mb-12">
                      <h2 className="font-serif text-xl md:text-2xl font-semibold text-brand-sage px-6">
                        More Accommodations
                      </h2>
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

          {/* Booking CTA */}
          <div className="mt-20 bg-gradient-to-br from-brand-cream to-brand-sand/40 rounded-2xl p-10 md:p-12 text-center border border-brand-sand">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-forest mb-4">
              Ready to Book?
            </h2>
            <p className="text-brand-charcoal mb-8 max-w-2xl mx-auto text-lg">
              Reserve your stay through Airbnb or Hipcamp, or contact us directly for group bookings and special arrangements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.airbnb.com/users/show/309588444"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.787c-.183.303-.453.508-.777.596-.324.088-.668.049-.968-.11a16.32 16.32 0 01-1.727-1.155c-1.199-.906-2.321-1.924-3.347-3.044-.506.555-1.037 1.088-1.592 1.595a18.01 18.01 0 01-1.79 1.494c-.3.206-.681.277-1.039.193a1.37 1.37 0 01-.789-.577c-.4-.649-.206-1.573.447-2.126.653-.553 1.359-1.048 2.108-1.477-1.053-1.445-1.881-3.053-2.442-4.766-.163-.498-.012-1.046.384-1.398.396-.352.958-.437 1.433-.217.475.22.797.674.822 1.156.168 1.371.601 2.697 1.277 3.896.676-1.199 1.109-2.525 1.277-3.896.025-.482.347-.936.822-1.156.475-.22 1.037-.135 1.433.217.396.352.547.9.384 1.398-.561 1.713-1.389 3.321-2.442 4.766.749.429 1.455.924 2.108 1.477.653.553.847 1.477.447 2.126z"/>
                </svg>
                View on Airbnb
              </a>
              <a
                href="https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline text-lg"
              >
                View on Hipcamp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
