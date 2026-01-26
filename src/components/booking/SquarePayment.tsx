'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Square?: any;
  }
}

interface SquarePaymentProps {
  amount: number; // In cents
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function SquarePayment({ amount, onSuccess, onError, disabled }: SquarePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const cardRef = useRef<any>(null);
  const paymentRef = useRef<any>(null);

  useEffect(() => {
    const loadSquare = async () => {
      // Load Square Web SDK
      if (!window.Square) {
        const script = document.createElement('script');
        script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'; // Use production URL in production
        script.async = true;
        script.onload = initializeSquare;
        document.body.appendChild(script);
      } else {
        initializeSquare();
      }
    };

    const initializeSquare = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
        if (!appId) {
          throw new Error('Square Application ID not configured');
        }

        const payments = window.Square.payments(appId, process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID);
        paymentRef.current = payments;

        const card = await payments.card();
        await card.attach('#card-container');
        cardRef.current = card;

        setInitialized(true);
      } catch (error: any) {
        console.error('Square initialization error:', error);
        onError('Payment system initialization failed. Please try again.');
      }
    };

    loadSquare();

    return () => {
      if (cardRef.current) {
        cardRef.current.destroy();
      }
    };
  }, [onError]);

  const handlePayment = async () => {
    if (!cardRef.current || !paymentRef.current) {
      onError('Payment not initialized');
      return;
    }

    setLoading(true);

    try {
      // Tokenize card details
      const tokenResult = await cardRef.current.tokenize();

      if (tokenResult.status === 'OK') {
        // Send token to backend for processing
        const response = await fetch('/api/booking/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            amount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Payment failed');
        }

        onSuccess(data.paymentId);
      } else {
        let errorMessage = 'Payment failed';
        if (tokenResult.errors) {
          errorMessage = tokenResult.errors.map((e: any) => e.message).join(', ');
        }
        onError(errorMessage);
      }
    } catch (error: any) {
      onError(error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div id="card-container" className="mb-4 min-h-[120px]" />

      {!initialized && (
        <div className="text-center py-4 text-gray-500">
          Loading payment form...
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={!initialized || loading || disabled}
        className="w-full bg-stone-800 text-white px-6 py-4 rounded-lg font-semibold hover:bg-stone-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
      >
        {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Secure payment powered by Square</span>
      </div>
    </div>
  );
}
