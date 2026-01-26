import Link from 'next/link';
import { sql } from '@/lib/db/client';

export const metadata = {
  title: 'Calendar Sync | Admin Dashboard',
};

export const dynamic = 'force-dynamic';

async function getExternalBookings() {
  const bookings = await sql`
    SELECT
      unit_id,
      source,
      COUNT(*) as count,
      MAX(updated_at) as last_sync
    FROM external_bookings
    WHERE check_out >= CURRENT_DATE
    GROUP BY unit_id, source
    ORDER BY unit_id, source
  `;
  return bookings;
}

async function getSyncStatus() {
  try {
    const bookings = await getExternalBookings();
    return { success: true, bookings };
  } catch (error) {
    return { success: false, error: 'Table not created yet' };
  }
}

export default async function CalendarSyncPage() {
  const status = await getSyncStatus();

  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Header */}
      <div className="bg-[#3A2A1E] text-white py-6 mb-8">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="text-[#CBB8A3] hover:text-[#F4F1EB] text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Calendar Sync</h1>
          <p className="text-[#CBB8A3] mt-2">Manage external platform calendars</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-4xl">
        {/* Sync Now Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Manual Sync</h2>
          <p className="text-gray-700 mb-4">
            Manually trigger a calendar sync to import the latest bookings from Airbnb, Hipcamp, and VRBO.
          </p>
          <form action="/api/calendar/sync" method="POST">
            <button
              type="submit"
              className="px-6 py-3 bg-[#3A2A1E] text-white rounded-lg font-semibold hover:bg-[#7D4830] transition-colors"
            >
              Sync All Calendars Now
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-3">
            This will fetch iCal feeds from all platforms and update blocked dates.
          </p>
        </div>

        {/* Sync Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Sync Status</h2>

          {!status.success ? (
            <div className="bg-[#F4F1EB] border border-[#CBB8A3] rounded-lg p-4">
              <p className="text-[#3A2A1E] mb-2">
                ⚠️ External bookings table not created yet
              </p>
              <p className="text-sm text-[#6B7A5A]">
                Run database setup: <code className="bg-[#CBB8A3]/30 px-2 py-1 rounded">node -e "require('./src/lib/db/setup').setupDatabase()"</code>
              </p>
            </div>
          ) : status.bookings && status.bookings.length === 0 ? (
            <div className="bg-[#F4F1EB] border border-[#6F8291]/30 rounded-lg p-4">
              <p className="text-[#3A2A1E] mb-2">No external bookings synced yet</p>
              <p className="text-sm text-[#6F8291]">
                Add iCal URLs in Sanity Studio, then click "Sync All Calendars Now" above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {status.bookings?.map((booking: any) => (
                <div key={`${booking.unit_id}-${booking.source}`} className="border border-[#CBB8A3] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{booking.unit_id}</div>
                      <div className="text-sm text-gray-600">
                        {booking.source.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{booking.count} bookings</div>
                      <div className="text-sm text-gray-600">
                        Last sync: {new Date(booking.last_sync).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Setup Instructions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Get iCal URLs</h3>
              <div className="space-y-3 ml-4">
                <div>
                  <strong className="text-sm">Airbnb:</strong>
                  <p className="text-sm text-gray-600">
                    Go to listing → Settings → Availability → Calendar sync → Export Calendar
                  </p>
                </div>
                <div>
                  <strong className="text-sm">Hipcamp:</strong>
                  <p className="text-sm text-gray-600">
                    Dashboard → Calendar → Export iCal feed
                  </p>
                </div>
                <div>
                  <strong className="text-sm">VRBO:</strong>
                  <p className="text-sm text-gray-600">
                    Calendar → Settings → Export iCal
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. Add URLs to Sanity</h3>
              <p className="text-sm text-gray-600 mb-2">
                Open Sanity Studio and add iCal URLs to each rental unit:
              </p>
              <Link
                href="/studio"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Open Sanity Studio
              </Link>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. Set Up Automatic Sync</h3>
              <p className="text-sm text-gray-600 mb-2">
                For automatic syncing, add to <code className="bg-stone-100 px-2 py-1 rounded">vercel.json</code>:
              </p>
              <pre className="bg-[#2B2B2B] text-[#F4F1EB] p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "crons": [{
    "path": "/api/calendar/sync",
    "schedule": "0 */6 * * *"
  }]
}`}
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                This syncs every 6 hours automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-[#6B7A5A]/10 border border-[#6B7A5A]/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✅ Calendar Sync Benefits</h3>
          <ul className="text-sm text-[#3A2A1E] space-y-1">
            <li>• Prevents double bookings across platforms</li>
            <li>• Automatic updates from Airbnb, Hipcamp, VRBO</li>
            <li>• Real-time availability on your site</li>
            <li>• No manual calendar management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
