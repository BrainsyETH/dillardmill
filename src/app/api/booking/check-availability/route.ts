import { NextRequest, NextResponse } from 'next/server';
import { checkAvailabilityWithExternal } from '@/lib/calendar/sync';

export async function POST(request: NextRequest) {
  try {
    const { unitId, checkIn, checkOut } = await request.json();

    if (!unitId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check availability including external calendar bookings
    const available = await checkAvailabilityWithExternal(unitId, checkIn, checkOut);

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
