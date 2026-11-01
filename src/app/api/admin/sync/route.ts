import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSite } from '@/lib/admin/guard';
import { syncAllExternalCalendars } from '@/lib/calendar/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const results = await syncAllExternalCalendars();
  return NextResponse.json({ results });
}
