import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | Pine Valley',
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      <div className="bg-[#3A2A1E] text-[#F4F1EB] py-6 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Pine Valley Admin Dashboard</h1>
          <p className="text-[#CBB8A3] mt-2">Manage your rental business</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Content Management */}
          <Link
            href="/studio"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#6B7A5A]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B7A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Content Studio</h3>
                <p className="text-sm text-gray-600">Sanity CMS</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Manage rental units, prices, amenities, descriptions, and images.
            </p>
            <div className="text-[#6B7A5A] font-semibold">
              Open Sanity Studio →
            </div>
          </Link>

          {/* Bookings */}
          <Link
            href="/admin/bookings"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#9C5A3C]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#9C5A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Bookings</h3>
                <p className="text-sm text-gray-600">View & Manage</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              View all bookings, guest details, payment status, and confirmation codes.
            </p>
            <div className="text-[#9C5A3C] font-semibold">
              View Bookings →
            </div>
          </Link>

          {/* Calendar Sync */}
          <Link
            href="/admin/calendar"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#6F8291]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6F8291]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Calendar Sync</h3>
                <p className="text-sm text-gray-600">External Platforms</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Sync calendars from Airbnb, Hipcamp, and VRBO. View all booked dates.
            </p>
            <div className="text-[#6F8291] font-semibold">
              Manage Calendars →
            </div>
          </Link>

          {/* Square Dashboard */}
          <a
            href="https://squareup.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#CBB8A3]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#CBB8A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Payments</h3>
                <p className="text-sm text-gray-600">Square Dashboard</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              View transactions, refunds, and financial reports in Square.
            </p>
            <div className="text-[#CBB8A3] font-semibold">
              Open Square Dashboard ↗
            </div>
          </a>

          {/* Email Logs */}
          <a
            href="https://resend.com/emails"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#6B7A5A]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B7A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Email Logs</h3>
                <p className="text-sm text-gray-600">Resend Dashboard</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              View sent confirmation emails, delivery status, and email analytics.
            </p>
            <div className="text-[#6B7A5A] font-semibold">
              Open Resend Dashboard ↗
            </div>
          </a>

          {/* Database */}
          <Link
            href="/admin/database"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#3A2A1E]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#3A2A1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Database</h3>
                <p className="text-sm text-gray-600">Direct Access</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Advanced database queries and data export options.
            </p>
            <div className="text-[#3A2A1E] font-semibold">
              Database Tools →
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/studio"
              className="bg-white border-2 border-[#CBB8A3] rounded-lg p-4 hover:border-[#6B7A5A] transition-colors"
            >
              <div className="font-semibold mb-1">Add New Unit</div>
              <div className="text-sm text-gray-600">Create a new rental listing</div>
            </Link>

            <Link
              href="/admin/calendar"
              className="bg-white border-2 border-[#CBB8A3] rounded-lg p-4 hover:border-[#6B7A5A] transition-colors"
            >
              <div className="font-semibold mb-1">Sync Calendars</div>
              <div className="text-sm text-gray-600">Update external bookings</div>
            </Link>

            <Link
              href="/admin/bookings"
              className="bg-white border-2 border-[#CBB8A3] rounded-lg p-4 hover:border-[#6B7A5A] transition-colors"
            >
              <div className="font-semibold mb-1">Today's Check-ins</div>
              <div className="text-sm text-gray-600">View arriving guests</div>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Update Prices:</strong> Go to Content Studio → Rental Units → Select unit → Edit pricing
            </p>
            <p>
              <strong>Add iCal URLs:</strong> Content Studio → Rental Units → Scroll to "Calendar Sync" section
            </p>
            <p>
              <strong>View Bookings:</strong> Click "Bookings" card above
            </p>
            <p>
              <strong>Refund Payment:</strong> Go to Square Dashboard → Find transaction → Issue refund
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
