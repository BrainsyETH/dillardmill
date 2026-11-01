// Card authorization (hold), capture, void, and refund through Square.
// A booking request authorizes the card without charging it; the owner's
// approval captures it.

import { getSquare, squareLocationId } from './client';

const MAX_HOLD_HOURS = 7 * 24; // Square limit for card-not-present delayed capture

export async function authorizeCard(params: {
  sourceId: string;
  verificationToken?: string;
  amountCents: number;
  idempotencyKey: string;
  holdHours: number;
  referenceId: string;
  buyerEmail: string;
  note: string;
}) {
  const { payment } = await getSquare().payments.create({
    sourceId: params.sourceId,
    verificationToken: params.verificationToken,
    idempotencyKey: params.idempotencyKey,
    amountMoney: { amount: BigInt(params.amountCents), currency: 'USD' },
    locationId: squareLocationId(),
    autocomplete: false,
    // Backstop: if our expiry job never runs, Square voids the hold itself.
    delayDuration: `PT${Math.min(MAX_HOLD_HOURS, params.holdHours)}H`,
    delayAction: 'CANCEL',
    referenceId: params.referenceId,
    buyerEmailAddress: params.buyerEmail,
    note: params.note.slice(0, 500),
  });
  if (!payment?.id || payment.status !== 'APPROVED') {
    throw new Error(`Card was not authorized (status ${payment?.status ?? 'unknown'})`);
  }
  return payment.id;
}

export async function capturePayment(paymentId: string) {
  const { payment } = await getSquare().payments.complete({ paymentId });
  if (payment?.status !== 'COMPLETED') {
    throw new Error(`Capture did not complete (status ${payment?.status ?? 'unknown'})`);
  }
}

export async function voidPayment(paymentId: string) {
  await getSquare().payments.cancel({ paymentId });
}

export async function refundPayment(params: {
  paymentId: string;
  amountCents: number;
  idempotencyKey: string;
  reason: string;
}) {
  const { refund } = await getSquare().refunds.refundPayment({
    paymentId: params.paymentId,
    idempotencyKey: params.idempotencyKey,
    amountMoney: { amount: BigInt(params.amountCents), currency: 'USD' },
    reason: params.reason.slice(0, 192),
  });
  if (!refund?.id) throw new Error('Refund was not created');
  return refund.id;
}
