import { NextRequest, NextResponse } from 'next/server';
import { getAllBookedDates } from '@/lib/calendar/sync';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const unitId = searchParams.get('unitId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!unitId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get all booked dates including external calendars
    const bookedRanges = await getAllBookedDates(unitId, startDate, endDate);

    return NextResponse.json({ bookedRanges });
  } catch (error) {
    console.error('Booked dates fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booked dates' },
      { status: 500 }
    );
  }
}
