import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getQuote } from '@/lib/booking/service';

export const dynamic = 'force-dynamic';

const schema = z.object({
  unitSlug: z.string().min(1).max(100),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().int(),
  pets: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  try {
    const { unitSlug, ...req } = parsed.data;
    const result = await getQuote(unitSlug, req);
    if (!result.ok) return NextResponse.json({ error: result.error, code: result.code }, { status: result.status });
    return NextResponse.json({ quote: result.quote, available: result.available, policies: result.policies });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json({ error: 'Could not price these dates right now.' }, { status: 500 });
  }
}
