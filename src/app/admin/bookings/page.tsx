import { sql } from '@/lib/db/client';
import Link from 'next/link';

export const metadata = {
  title: 'Bookings | Admin Dashboard',
};

// Disable caching for admin pages
export const dynamic = 'force-dynamic';

async function getBookings() {
  const bookings = await sql`
    SELECT * FROM bookings
    ORDER BY check_in DESC, created_at DESC
    LIMIT 100
  `;
  return bookings;
}

async function getStats() {
  const upcoming = await sql`
    SELECT COUNT(*) as count FROM bookings
    WHERE check_in >= CURRENT_DATE
      AND booking_status = 'confirmed'
  `;

  const checkins = await sql`
    SELECT COUNT(*) as count FROM bookings
    WHERE check_in = CURRENT_DATE
      AND booking_status = 'confirmed'
  `;

  const revenue = await sql`
    SELECT SUM(total_amount) as total FROM bookings
    WHERE booking_status = 'confirmed'
      AND payment_status = 'paid'
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
  `;

  return {
    upcoming: Number(upcoming[0]?.count || 0),
    todayCheckins: Number(checkins[0]?.count || 0),
    monthlyRevenue: Number(revenue[0]?.total || 0) / 100,
  };
}

export default async function BookingsPage() {
  const bookings = await getBookings();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Header */}
      <div className="bg-[#3A2A1E] text-white py-6 mb-8">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="text-[#CBB8A3] hover:text-[#F4F1EB] text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-[#CBB8A3] mt-2">Manage all reservations</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Upcoming Bookings</div>
            <div className="text-4xl font-bold text-[#3A2A1E]">{stats.upcoming}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Check-ins Today</div>
            <div className="text-4xl font-bold text-[#6B7A5A]">{stats.todayCheckins}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Revenue (30 days)</div>
            <div className="text-4xl font-bold text-[#9C5A3C]">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-[#CBB8A3]">
            <h2 className="text-xl font-bold">Recent Bookings</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">No bookings yet</p>
              <p className="text-sm">Bookings will appear here once guests make reservations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F4F1EB] border-b border-[#CBB8A3]">
                  <tr>
                    <th className="text-left p-4 font-semibold">Confirmation</th>
                    <th className="text-left p-4 font-semibold">Guest</th>
                    <th className="text-left p-4 font-semibold">Unit</th>
                    <th className="text-left p-4 font-semibold">Check-in</th>
                    <th className="text-left p-4 font-semibold">Check-out</th>
                    <th className="text-left p-4 font-semibold">Nights</th>
                    <th className="text-left p-4 font-semibold">Total</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b border-[#CBB8A3]/50 hover:bg-[#F4F1EB]">
                      <td className="p-4">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="font-mono text-sm text-[#9C5A3C] hover:underline"
                        >
                          {booking.confirmation_code}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{booking.guest_name}</div>
                        <div className="text-sm text-gray-600">{booking.guest_email}</div>
                      </td>
                      <td className="p-4 text-sm">{booking.unit_name}</td>
                      <td className="p-4 text-sm">
                        {new Date(booking.check_in).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(booking.check_out).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">{booking.num_nights}</td>
                      <td className="p-4 font-semibold">
                        ${(booking.total_amount / 100).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.booking_status === 'confirmed'
                              ? 'bg-[#6B7A5A]/10 text-[#3A2A1E]'
                              : booking.booking_status === 'cancelled'
                              ? 'bg-[#9C5A3C]/10 text-[#3A2A1E]'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold mb-4">Export & Filter</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-[#3A2A1E] text-white rounded-lg hover:bg-[#7D4830]">
              Export to CSV
            </button>
            <button className="px-4 py-2 border-2 border-stone-800 text-[#3A2A1E] rounded-lg hover:bg-stone-100">
              Filter by Date
            </button>
            <button className="px-4 py-2 border-2 border-stone-800 text-[#3A2A1E] rounded-lg hover:bg-stone-100">
              Filter by Unit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
