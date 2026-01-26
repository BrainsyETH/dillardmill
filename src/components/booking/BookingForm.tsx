'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DatePicker } from './DatePicker';
import { GuestSelector } from './GuestSelector';
import { SquarePayment } from './SquarePayment';
import { differenceInDays } from 'date-fns';

interface BookingFormProps {
  unit: {
    _id: string;
    name: string;
    slug: { current: string };
    basePrice: number;
    cleaningFee: number;
    minStay?: number;
    maxGuests: number;
  };
}

export function BookingForm({ unit }: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'dates' | 'details' | 'payment'>('dates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [numGuests, setNumGuests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Calculate pricing
  const numNights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const basePrice = unit.basePrice || 0;
  const cleaningFee = unit.cleaningFee || 0;
  const subtotal = numNights * basePrice;
  const total = subtotal + cleaningFee;

  // Validation
  const canProceedToDates = checkIn && checkOut && numNights >= (unit.minStay || 1);
  const canProceedToPayment = canProceedToDates && guestName && guestEmail && numGuests > 0 && numGuests <= unit.maxGuests;

  const handleDateSelection = async () => {
    if (!checkIn || !checkOut) return;

    setLoading(true);
    setError(null);

    try {
      // Check availability
      const response = await fetch('/api/booking/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: unit._id,
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (!data.available) {
        setError('These dates are not available. Please select different dates.');
        return;
      }

      setStep('details');
    } catch (err) {
      setError('Error checking availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    if (!checkIn || !checkOut) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: unit._id,
          unitName: unit.name,
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
          numGuests,
          numNights,
          basePrice,
          cleaningFee,
          totalAmount: total * 100, // Convert to cents
          paymentId,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      // Redirect to confirmation page
      router.push(`/booking/confirmation/${data.confirmationCode}`);
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please contact us.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${step === 'dates' ? 'text-stone-800' : 'text-gray-400'}`}>
            <div className="text-sm font-semibold">1. Dates</div>
          </div>
          <div className={`flex-1 ${step === 'details' ? 'text-stone-800' : 'text-gray-400'}`}>
            <div className="text-sm font-semibold">2. Details</div>
          </div>
          <div className={`flex-1 ${step === 'payment' ? 'text-stone-800' : 'text-gray-400'}`}>
            <div className="text-sm font-semibold">3. Payment</div>
          </div>
        </div>
        <div className="mt-2 h-1 bg-gray-200 rounded-full">
          <div
            className="h-full bg-stone-800 rounded-full transition-all"
            style={{
              width: step === 'dates' ? '33%' : step === 'details' ? '66%' : '100%',
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Date Selection */}
      {step === 'dates' && (
        <div>
          <h3 className="text-xl font-bold mb-4">Select Your Dates</h3>

          <DatePicker
            unitId={unit._id}
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
          />

          {checkIn && checkOut && (
            <div className="mt-6 p-4 bg-stone-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  ${basePrice} × {numNights} night{numNights !== 1 ? 's' : ''}
                </span>
                <span className="font-semibold">${subtotal}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Cleaning fee</span>
                <span className="font-semibold">${cleaningFee}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl">${total}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleDateSelection}
            disabled={!canProceedToDates || loading}
            className="mt-6 w-full bg-stone-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-stone-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Checking availability...' : 'Continue'}
          </button>

          {unit.minStay && unit.minStay > 1 && (
            <p className="mt-3 text-sm text-gray-500 text-center">
              Minimum stay: {unit.minStay} nights
            </p>
          )}
        </div>
      )}

      {/* Step 2: Guest Details */}
      {step === 'details' && (
        <div>
          <button
            onClick={() => setStep('dates')}
            className="text-stone-700 hover:text-stone-900 text-sm mb-4"
          >
            ← Back to dates
          </button>

          <h3 className="text-xl font-bold mb-4">Guest Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests *
              </label>
              <GuestSelector
                value={numGuests}
                onChange={setNumGuests}
                max={unit.maxGuests}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
                placeholder="Let us know if you have any special requests..."
              />
            </div>
          </div>

          <button
            onClick={() => setStep('payment')}
            disabled={!canProceedToPayment}
            className="mt-6 w-full bg-stone-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-stone-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 'payment' && (
        <div>
          <button
            onClick={() => setStep('details')}
            className="text-stone-700 hover:text-stone-900 text-sm mb-4"
          >
            ← Back to details
          </button>

          <h3 className="text-xl font-bold mb-4">Payment</h3>

          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-stone-50 rounded-lg">
            <h4 className="font-semibold mb-3">{unit.name}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span>{checkIn?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span>{checkOut?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span>{numGuests}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>

          <SquarePayment
            amount={total * 100} // Convert to cents
            onSuccess={handlePaymentSuccess}
            onError={(err) => setError(err)}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
