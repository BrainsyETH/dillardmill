import { NextRequest, NextResponse } from 'next/server';
import { bookingRequestSchema, requestBooking } from '@/lib/booking/service';

export const dynamic = 'force-dynamic';
// Calendar refresh + Square authorization can take several seconds.
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const parsed = bookingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path.join('.') ?? 'request';
    return NextResponse.json(
      { error: field === 'acceptedPolicies' ? 'Please accept the policies to continue.' : `Please check: ${field}`, code: 'invalid' },
      { status: 400 },
    );
  }
  try {
    const result = await requestBooking(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error, code: result.code, quote: result.quote }, { status: result.status });
    }
    return NextResponse.json({ confirmationCode: result.confirmationCode });
  } catch (error) {
    console.error('Booking request error:', error);
    return NextResponse.json(
      { error: 'Something went wrong and your card was not charged. Please try again or contact us.' },
      { status: 500 },
    );
  }
}
