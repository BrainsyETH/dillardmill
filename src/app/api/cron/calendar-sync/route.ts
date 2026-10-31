import { NextRequest, NextResponse } from 'next/server';
import { syncAllExternalCalendars } from '@/lib/calendar/sync';
import { expireRequests } from '@/lib/booking/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Scheduled by vercel.json. Vercel sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [sync, expiry] = await Promise.all([syncAllExternalCalendars(), expireRequests()]);
  return NextResponse.json({
    synced: sync.filter((r) => r.success).length,
    failed: sync.filter((r) => !r.success),
    expiredRequests: expiry.expired,
  });
}
