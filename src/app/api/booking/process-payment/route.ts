import { NextRequest, NextResponse } from 'next/server';
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square/client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { sourceId, amount } = await request.json();

    if (!sourceId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process payment with Square
    const result = await squareClient.payments.create({
      sourceId,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD',
      },
      locationId: SQUARE_LOCATION_ID,
      idempotencyKey: randomUUID(),
    });

    if (result.payment?.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        paymentId: result.payment.id,
      });
    } else {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment processing error:', error);

    // Handle Square-specific errors
    if (error.errors) {
      const errorMessage = error.errors.map((e: any) => e.detail).join(', ');
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
