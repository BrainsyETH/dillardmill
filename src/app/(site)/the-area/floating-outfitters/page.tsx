import Link from 'next/link';
import FloatingOutfitters from '@/components/area/FloatingOutfitters';

export const metadata = {
  title: 'Floating Outfitters Near Pine Valley | Canoe, Kayak & Raft Rentals',
  description:
    'Canoe, kayak, raft and tube outfitters on the Huzzah, Courtois, Meramec and Current rivers — with live river conditions, drive times from Pine Valley, and one-tap directions.',
};

export default function FloatingOutfittersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-forest py-20 text-brand-cream">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-brand-copper/15 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl">
            <nav className="mb-4 text-sm text-brand-sand/80">
              <Link href="/the-area" className="transition-colors hover:text-brand-cream">
                The Area
              </Link>
              <span className="mx-2">/</span>
              <span className="text-brand-sand/60">Floating Outfitters</span>
            </nav>
            <span className="mb-4 inline-block font-medium tracking-wide text-brand-copper">
              PLAN YOUR FLOAT
            </span>
            {/* inline color overrides the global unlayered `h1` color rule so the cream heading shows on the forest hero */}
            <h1
              style={{ color: 'var(--color-cream)' }}
              className="mb-6 font-serif text-4xl font-semibold md:text-5xl lg:text-6xl"
            >
              Floating Outfitters Near Pine Valley
            </h1>
            <p className="text-xl leading-relaxed text-brand-sand/90">
              The Ozarks are float country. Within a couple hours of the property you can put in
              on four clearwater rivers — from the twisting Huzzah just up the road to the
              spring-fed Current deep in the National Scenic Riverways.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Legend */}
        <div className="mb-12 flex flex-col gap-3 rounded-2xl border border-brand-sand bg-brand-cream p-5 text-sm text-brand-charcoal sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-relaxed">
            Each river shows <strong className="font-semibold text-brand-forest">live conditions</strong>{' '}
            from Eddy. Drive times are approximate, measured from the property.
          </p>
          <p className="text-brand-stone">
            <span className="mr-1.5 rounded bg-brand-sage/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-forest">
              NPS
            </span>
            National Park Service concessioner
          </p>
        </div>

        <FloatingOutfitters />

        {/* Closing note */}
        <div className="mt-16 rounded-3xl bg-brand-forest p-10 text-center md:p-14">
          <h2
            style={{ color: 'var(--color-cream)' }}
            className="mb-3 font-serif text-2xl font-semibold md:text-3xl"
          >
            Check the water before you go
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-brand-sand/90">
            River levels change fast in the Ozarks. Live conditions, full river guides, and trip
            planning are available any time on Eddy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://eddy.guide"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Open Eddy
            </a>
            <Link href="/the-area" className="btn btn-outline-light">
              Back to The Area
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
