import Link from 'next/link';
import { getAllUnits } from '@/lib/sanity/queries';
import { UnitCard } from '@/components/units/UnitCard';
import AvailabilitySearch from '@/components/booking/AvailabilitySearch';
import { generateLodgingBusinessSchema, generateJsonLdScript } from '@/lib/schema';

export const metadata = {
  title: 'Lodging | Pine Valley at Dillard Mill',
  description:
    "Browse our unique rental units including vintage Airstreams, cozy cottages, and event spaces in Missouri's Mark Twain National Forest.",
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function buildSearchQuery(params: {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}): string {
  const next = new URLSearchParams();
  if (params.checkIn && ISO_DATE_RE.test(params.checkIn)) {
    next.set('checkIn', params.checkIn);
  }
  if (params.checkOut && ISO_DATE_RE.test(params.checkOut)) {
    next.set('checkOut', params.checkOut);
  }
  const guestsNum = Number.parseInt(params.guests ?? '', 10);
  if (Number.isFinite(guestsNum) && guestsNum > 0) {
    next.set('guests', String(guestsNum));
  }
  return next.toString();
}

const BOOK_DIRECT_BENEFITS = [
  {
    title: 'No platform fees',
    description:
      'Skip the service charges added by Airbnb and Hipcamp — you pay the host, not the middleman.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: 'Talk to real hosts',
    description:
      'Questions about group bookings, pets, or accessibility? Get answers straight from us, not a support queue.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
  },
  {
    title: 'Flexible stays',
    description:
      'Custom requests, multi-unit reservations, and whole-property bookings — possible when you work with us directly.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
];

interface UnitsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UnitsPage({ searchParams }: UnitsPageProps) {
  // Exclude "Book the Farm" — it has a dedicated page and footer link,
  // so we don't list it as a regular lodging unit here.
  const units = (await getAllUnits()).filter(
    (unit) => unit.slug.current !== 'book-the-farm'
  );
  const lodgingSchema = generateLodgingBusinessSchema(units);

  const resolvedParams = (await searchParams) ?? {};
  const searchQuery = buildSearchQuery({
    checkIn: toParam(resolvedParams.checkIn),
    checkOut: toParam(resolvedParams.checkOut),
    guests: toParam(resolvedParams.guests),
  });

  // Separate featured and regular units
  const featuredUnits = units.filter((unit) => unit.featured);
  const regularUnits = units.filter((unit) => !unit.featured);

  const largestUnit = units.reduce(
    (max, unit) => (unit.maxGuests > max ? unit.maxGuests : max),
    1
  );

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLdScript(lodgingSchema)}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-brand-forest text-brand-cream py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
                ACCOMMODATIONS
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-brand-cream">
                Our Lodging
              </h1>
              <p className="text-xl text-brand-sand/90 leading-relaxed">
                From vintage Airstreams to cozy cottages, find your perfect retreat at Pine Valley.
                Each unit offers a unique experience while surrounded by the beauty of Mark Twain National Forest.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          {/* Availability search — pulls the guest's dates straight into the
              booking form on each unit page. */}
          <div className="-mt-10 sm:-mt-14 relative z-10 max-w-5xl mx-auto">
            <AvailabilitySearch maxGuests={Math.max(largestUnit, 12)} />
          </div>

          {/* Why Book Direct */}
          <section aria-labelledby="why-book-direct" className="py-14">
            <div className="text-center mb-10">
              <span className="inline-block text-brand-copper font-medium tracking-wide mb-3">
                BOOK DIRECT
              </span>
              <h2
                id="why-book-direct"
                className="font-serif text-3xl md:text-4xl font-semibold text-brand-forest"
              >
                Why book with us directly
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {BOOK_DIRECT_BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white rounded-2xl border border-brand-sand p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-sage/15 text-brand-forest mb-4">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {benefit.icon}
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-brand-forest mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-brand-stone leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {units.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-brand-sand/30 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-brand-stone"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-brand-forest mb-4">
                  Accommodations Coming Soon
                </h2>
                <p className="text-brand-stone mb-8">
                  Our accommodations are being prepared. Check back soon or contact us for availability!
                </p>
                <Link href="/contact" className="btn btn-primary">
                  Contact Us for Availability
                </Link>
              </div>
            </div>
          ) : (
            <>
              {featuredUnits.length > 0 && (
                <div className="mb-20">
                  <div className="section-header justify-center mb-12">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-forest px-6">
                      Featured Property
                    </h2>
                  </div>
                  <div className="space-y-8">
                    {featuredUnits.map((unit) => (
                      <UnitCard
                        key={unit._id}
                        unit={unit}
                        featured={true}
                        searchQuery={searchQuery || undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

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
                      <UnitCard
                        key={unit._id}
                        unit={unit}
                        featured={false}
                        searchQuery={searchQuery || undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Booking CTA — direct booking first, external platforms second */}
          <div className="mt-20 bg-gradient-to-br from-brand-cream to-brand-sand/40 rounded-2xl p-10 md:p-12 text-center border border-brand-sand">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-forest mb-4">
              Ready to Book?
            </h2>
            <p className="text-brand-charcoal mb-8 max-w-2xl mx-auto text-lg">
              Pick a unit above to book directly with us — no platform fees, secure Square payment,
              and instant confirmation. Prefer a familiar platform? Airbnb and Hipcamp also have us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact" className="btn btn-primary text-lg">
                Have a question? Contact us
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <a
                  href="https://www.airbnb.com/rooms/44360355"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-stone hover:text-brand-forest underline underline-offset-4 transition-colors"
                >
                  Airbnb
                </a>
                <span className="text-brand-sand">·</span>
                <a
                  href="https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-stone hover:text-brand-forest underline underline-offset-4 transition-colors"
                >
                  Hipcamp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
