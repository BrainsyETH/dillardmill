import Link from 'next/link';

export const metadata = {
  title: 'Booking Request | Pine Valley',
  description: 'Request availability and pricing for your stay at Pine Valley near Dillard Mill.',
};

export default function BookingRequestPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Header */}
      <div className="bg-[#3A2A1E] text-[#F4F1EB] py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Request a Booking</h1>
          <p className="text-xl text-[#CBB8A3]">
            Get in touch to check availability and reserve your dates
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Booking Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Direct Booking */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#CBB8A3]">
            <h2 className="text-2xl font-bold text-[#3A2A1E] mb-4">Book Directly</h2>
            <p className="text-[#2B2B2B] mb-6">
              Choose your unit and book instantly with our online booking system.
            </p>
            <Link
              href="/lodging"
              className="inline-block bg-gradient-to-r from-[#9C5A3C] to-[#7D4830] text-[#F4F1EB] px-6 py-3 rounded-lg font-bold hover:from-[#7D4830] hover:to-[#6B3825] transition-all"
            >
              View Lodging & Book
            </Link>
          </div>

          {/* Contact Us */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#CBB8A3]">
            <h2 className="text-2xl font-bold text-[#3A2A1E] mb-4">Questions First?</h2>
            <p className="text-[#2B2B2B] mb-6">
              Have questions or need a custom arrangement? Get in touch with us directly.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#6B7A5A] text-[#F4F1EB] px-6 py-3 rounded-lg font-bold hover:bg-[#556148] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Alternative Platforms */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#3A2A1E] mb-6">Book on Other Platforms</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F4F1EB] rounded-lg border border-[#CBB8A3]">
              <div>
                <h3 className="font-bold text-[#3A2A1E]">Airbnb</h3>
                <p className="text-sm text-[#6F8291]">Browse our listings on Airbnb</p>
              </div>
              <a
                href="https://www.airbnb.com/users/show/309588444"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#9C5A3C] text-[#F4F1EB] px-6 py-2 rounded-lg font-semibold hover:bg-[#7D4830] transition-colors"
              >
                View Airbnb
              </a>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F4F1EB] rounded-lg border border-[#CBB8A3]">
              <div>
                <h3 className="font-bold text-[#3A2A1E]">Hipcamp</h3>
                <p className="text-sm text-[#6F8291]">Book through Hipcamp for outdoor stays</p>
              </div>
              <a
                href="https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#9C5A3C] text-[#F4F1EB] px-6 py-2 rounded-lg font-semibold hover:bg-[#7D4830] transition-colors"
              >
                View Hipcamp
              </a>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#6B7A5A]/10 border-2 border-[#6B7A5A]/30 rounded-lg p-6">
          <h3 className="font-bold text-[#3A2A1E] mb-3">Need Help?</h3>
          <p className="text-[#2B2B2B] mb-4">
            For group bookings, special events, or custom arrangements, please contact us directly.
            We're happy to work with you to create the perfect experience at Pine Valley.
          </p>
          <div className="text-[#2B2B2B]">
            <p><strong>Phone:</strong> <a href="tel:+13148434321" className="text-[#9C5A3C] hover:underline">(314) 843-4321</a></p>
            <p><strong>Email:</strong> <a href="mailto:pinevalley@dillardmill.com" className="text-[#9C5A3C] hover:underline">pinevalley@dillardmill.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
