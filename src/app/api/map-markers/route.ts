import { NextResponse } from 'next/server';
import { getMapMarkers } from '@/lib/db/map-markers';

// Public, read-only marker list for the property maps and embeds.
// Editing goes through /api/admin/map-markers (owner session required).
export const revalidate = 300;

export async function GET() {
  try {
    return NextResponse.json({ markers: await getMapMarkers() });
  } catch (error) {
    console.error('GET /api/map-markers error:', error);
    return NextResponse.json({ error: 'Failed to load map markers' }, { status: 500 });
  }
}
