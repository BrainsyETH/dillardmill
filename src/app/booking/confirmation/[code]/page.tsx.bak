import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBookingByConfirmation } from '@/lib/db/bookings';

export const metadata = {
  title: 'Booking Confirmed | Pine Valley',
  description: 'Your Pine Valley booking is confirmed.',
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const booking = await getBookingByConfirmation(code);

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-4">
              Thank you for booking with Pine Valley
            </p>

            <div className="inline-block bg-stone-100 px-6 py-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Confirmation Code</div>
              <div className="text-2xl font-bold font-mono">{booking.confirmation_code}</div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Booking Details</h2>

            <div className="space-y-4">
              <div className="flex justify-between pb-3 border-b border-stone-200">
                <span className="text-gray-600">Unit</span>
                <span className="font-semibold">{booking.unit_name}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-stone-200">
                <span className="text-gray-600">Guest Name</span>
                <span className="font-semibold">{booking.guest_name}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-stone-200">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold">{booking.guest_email}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-stone-200">
                <span className="text-gray-600">Check-in</span>
                <span className="font-semibold">
                  {new Date(booking.check_in).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between pb-3 border-b border-stone-200">
                <span className="text-gray-600">Check-out</span>
                <span className="font-semibold">
                  {new Date(booking.check_out).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between pb-3 border-b border-stone-200">
                <span className="text-gray-600">Guests</span>
                <span className="font-semibold">{booking.num_guests}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-stone-200">
                <span className="text-gray-600">Nights</span>
                <span className="font-semibold">{booking.num_nights}</span>
              </div>

              <div className="flex justify-between pt-3">
                <span className="text-lg font-bold">Total Paid</span>
                <span className="text-2xl font-bold text-green-600">
                  ${(booking.total_amount / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">What's Next?</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-stone-800 text-white rounded-full flex items-center justify-center text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Confirmation Email</h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a confirmation email to {booking.guest_email} with all the details.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-stone-800 text-white rounded-full flex items-center justify-center text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Check-in Instructions</h3>
                  <p className="text-gray-600 text-sm">
                    You'll receive detailed check-in instructions 48 hours before your arrival.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-stone-800 text-white rounded-full flex items-center justify-center text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Arrive & Enjoy</h3>
                  <p className="text-gray-600 text-sm">
                    Check in after 3:00 PM on your arrival day and enjoy your stay!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-stone-800 text-white rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Property Address</h2>
            <p className="text-lg mb-2">
              126 Dillard Mill Road<br />
              Davisville, MO 65456
            </p>
            <p className="text-stone-300 text-sm">
              Within walking distance of historic Dillard Mill State Historic Site
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Questions?</h2>
            <p className="text-gray-600 mb-4">
              We're here to help make your stay amazing
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:pinevalley@dillardmill.com"
                className="inline-block border-2 border-stone-800 text-stone-800 px-6 py-3 rounded-lg font-semibold hover:bg-stone-100 transition-colors"
              >
                Email Us
              </a>
              <a
                href="tel:+13148434321"
                className="inline-block bg-stone-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-stone-700 transition-colors"
              >
                Call (314) 843-4321
              </a>
            </div>
          </div>

          {/* Back to Site */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-stone-700 hover:text-stone-900 font-semibold"
            >
              ← Back to Pine Valley
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
