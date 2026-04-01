import Link from 'next/link';

export const metadata = {
  title: 'Camping | Pine Valley at Dillard Mill',
  description: 'Tent camping and RV camping at Pine Valley near Dillard Mill. Primitive campsites, RV pads with hookups, and glamping in the Missouri Ozarks.',
};

export default function CampingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#2C3E2D] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Camping at Pine Valley</h1>
          <p className="text-xl text-[#A8C5A0] max-w-2xl mx-auto">
            From glamping in vintage airstreams to primitive tent camping in the woods — there&apos;s a spot for everyone.
          </p>
        </div>
      </section>

      {/* Camping Options */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#3A2A1E] mb-8 text-center">Camping Options</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tent Camping */}
            <div className="bg-[#F4F1EB] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-[#3A2A1E] mb-4">Tent Camping</h3>
              <p className="text-[#5C4A3A] mb-4">
                Pitch a tent in our large backyard lawn, or for the more adventurous, hike down to the woods and set up your own primitive campsite.
              </p>
              <ul className="text-[#5C4A3A] space-y-2">
                <li>- Large backyard lawn area</li>
                <li>- Primitive woodland campsites</li>
                <li>- Designated campfire pits</li>
                <li>- Access to outdoor bath & shower house</li>
                <li>- Full bathroom available in the barn</li>
              </ul>
            </div>

            {/* RV Camping */}
            <div className="bg-[#F4F1EB] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-[#3A2A1E] mb-4">RV Camping</h3>
              <p className="text-[#5C4A3A] mb-4">
                Bring your RV and enjoy all the amenities of Pine Valley with the comfort of your own rig.
              </p>
              <ul className="text-[#5C4A3A] space-y-2">
                <li>- 1 concrete pad with full service hookups</li>
                <li>- 2 grass pads with limited service</li>
                <li>- Available with group bookings</li>
                <li>- WiFi access</li>
                <li>- Access to all property amenities</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Glamping */}
      <section className="py-16 bg-[#F4F1EB]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#3A2A1E] mb-4 text-center">Glamping</h2>
          <p className="text-[#5C4A3A] text-center mb-8 max-w-2xl mx-auto">
            Not the roughing-it type? Our vintage airstreams and tiny cabins offer a camping-style getaway with the comforts of home.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/airstream" className="block bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-[#3A2A1E] mb-2">The Argosy Airstream</h3>
              <p className="text-[#5C4A3A]">Sleeps 4 - Queen bed + 2 twins, AC, private deck</p>
            </Link>
            <Link href="/sebastian" className="block bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-[#3A2A1E] mb-2">The Sherman Airstream</h3>
              <p className="text-[#5C4A3A]">Sleeps 4 - Queen bed + 2 twins, AC, private deck</p>
            </Link>
            <Link href="/tiny-cabin-1" className="block bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-[#3A2A1E] mb-2">Tiny Cabin #1</h3>
              <p className="text-[#5C4A3A]">Sleeps 2 - Queen bed, air conditioned</p>
            </Link>
            <Link href="/tiny-cabin-2" className="block bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-[#3A2A1E] mb-2">Tiny Cabin #2</h3>
              <p className="text-[#5C4A3A]">Sleeps 2 - Queen bed, air conditioned</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Good to Know */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#3A2A1E] mb-8 text-center">Good to Know</h2>
          <div className="bg-[#F4F1EB] rounded-lg p-8">
            <ul className="text-[#5C4A3A] space-y-4">
              <li><strong>Check-in:</strong> 12pm Friday</li>
              <li><strong>Check-out:</strong> 12pm Sunday</li>
              <li><strong>Minimum stay:</strong> 2 nights</li>
              <li><strong>Pets:</strong> Welcome for an extra $50 per stay</li>
              <li><strong>Cell service:</strong> AT&T has limited reception. Sprint is spotty. Verizon is mostly unavailable. Free WiFi is provided but is rather slow.</li>
              <li><strong>Bathrooms:</strong> Outdoor bath & shower house available. Full bathroom in the barn.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#2C3E2D] text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Camp?</h2>
          <p className="text-[#A8C5A0] mb-8 max-w-xl mx-auto">
            Camping is available as part of our group bookings when you Book the Farm.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/book-the-farm"
              className="bg-[#9C5A3C] hover:bg-[#7D4830] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Book the Farm
            </Link>
            <Link
              href="/booking-request"
              className="border-2 border-white hover:bg-white hover:text-[#2C3E2D] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
