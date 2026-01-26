import { NextRequest, NextResponse } from 'next/server';
import { syncAllExternalCalendars } from '@/lib/calendar/sync';

// This endpoint syncs all external calendars (Airbnb, Hipcamp, VRBO)
// Can be triggered manually or by a cron job

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting calendar sync...');
    const results = await syncAllExternalCalendars();

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Calendar sync complete: ${successCount} successful, ${failureCount} failed`,
      results,
    });
  } catch (error: any) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Calendar sync failed', details: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET() {
  return POST(new NextRequest('http://localhost:3000/api/calendar/sync'));
}
