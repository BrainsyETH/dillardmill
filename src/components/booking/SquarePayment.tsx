'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// Minimal typings for the Square Web Payments SDK we use.
interface SquareCard {
  attach(selector: string): Promise<void>;
  tokenize(): Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
  destroy(): Promise<void>;
}
interface SquarePayments {
  card(): Promise<SquareCard>;
  verifyBuyer?(
    token: string,
    details: Record<string, unknown>,
  ): Promise<{ token?: string } | null>;
}
declare global {
  interface Window {
    Square?: { payments(appId: string, locationId: string): SquarePayments };
  }
}

const IS_PROD = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production';
const SCRIPT_SRC = IS_PROD
  ? 'https://web.squarecdn.com/v1/square.js'
  : 'https://sandbox.web.squarecdn.com/v1/square.js';

function loadScript(): Promise<void> {
  if (window.Square) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
  return new Promise((resolve, reject) => {
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Could not load the payment form.')));
    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export interface CardHandle {
  /** Tokenize the card and run buyer verification (3-D Secure) when available. */
  tokenize(details: {
    amountCents: number;
    givenName: string;
    familyName: string;
    email: string;
    phone: string;
  }): Promise<{ sourceId: string; verificationToken?: string }>;
}

export const SquarePayment = forwardRef<CardHandle, { onReadyChange?: (ready: boolean) => void }>(
  function SquarePayment({ onReadyChange }, ref) {
    const cardRef = useRef<SquareCard | null>(null);
    const paymentsRef = useRef<SquarePayments | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
          const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
          if (!appId || !locationId) throw new Error('Online payments are not configured yet.');
          await loadScript();
          if (cancelled || !window.Square) return;
          const payments = window.Square.payments(appId, locationId);
          const card = await payments.card();
          if (cancelled) {
            await card.destroy();
            return;
          }
          await card.attach('#square-card');
          paymentsRef.current = payments;
          cardRef.current = card;
          setReady(true);
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the payment form.');
        }
      })();
      return () => {
        cancelled = true;
        cardRef.current?.destroy().catch(() => {});
        cardRef.current = null;
      };
    }, []);

    useEffect(() => onReadyChange?.(ready), [ready, onReadyChange]);

    useImperativeHandle(ref, () => ({
      async tokenize(details) {
        if (!cardRef.current) throw new Error('The payment form is still loading.');
        const result = await cardRef.current.tokenize();
        if (result.status !== 'OK' || !result.token) {
          throw new Error(result.errors?.map((e) => e.message).join(' ') || 'Please check your card details.');
        }
        let verificationToken: string | undefined;
        try {
          const verification = await paymentsRef.current?.verifyBuyer?.(result.token, {
            amount: (details.amountCents / 100).toFixed(2),
            currencyCode: 'USD',
            intent: 'CHARGE',
            billingContact: {
              givenName: details.givenName,
              familyName: details.familyName,
              email: details.email,
              phone: details.phone,
            },
          });
          verificationToken = verification?.token;
        } catch (e) {
          // Verification is best-effort; Square still screens the authorization.
          console.warn('Buyer verification skipped:', e);
        }
        return { sourceId: result.token, verificationToken };
      },
    }));

    return (
      <div>
        <div id="square-card" className="min-h-[90px]" />
        {!ready && !error && <p className="text-sm text-brand-charcoal/60">Loading secure card form…</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!IS_PROD && ready && (
          <p className="text-xs text-amber-700 mt-1">Test mode — use Square sandbox card 4111 1111 1111 1111.</p>
        )}
      </div>
    );
  },
);
