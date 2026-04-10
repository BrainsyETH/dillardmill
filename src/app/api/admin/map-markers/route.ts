import { NextRequest, NextResponse } from 'next/server';
import { getMapMarkers, saveMapMarkers } from '@/lib/db/map-markers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const markers = await getMapMarkers();
    return NextResponse.json({ markers });
  } catch (error) {
    console.error('GET /api/admin/map-markers error:', error);
    return NextResponse.json(
      { error: 'Failed to load map markers' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.markers)) {
      return NextResponse.json(
        { error: 'Invalid payload: expected { markers: [...] }' },
        { status: 400 }
      );
    }
    await saveMapMarkers(body.markers);
    return NextResponse.json({ success: true, count: body.markers.length });
  } catch (error) {
    console.error('PUT /api/admin/map-markers error:', error);
    return NextResponse.json(
      { error: 'Failed to save map markers' },
      { status: 500 }
    );
  }
}
