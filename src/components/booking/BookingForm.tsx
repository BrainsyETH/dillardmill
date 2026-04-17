'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    baseGuests?: number;
    extraGuestFee?: number;
    petsAllowed?: boolean;
    maxPets?: number;
    petFee?: number;
    minStay?: number;
    maxGuests: number;
  };
  /** Pre-fill check-in date (accepts Date or ISO yyyy-mm-dd). */
  initialCheckIn?: Date | string;
  /** Pre-fill check-out date (accepts Date or ISO yyyy-mm-dd). */
  initialCheckOut?: Date | string;
  /** Pre-fill the guest count. Capped to the unit's maxGuests. */
  initialGuests?: number;
}

function parseDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function BookingForm({
  unit,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'dates' | 'details' | 'payment'>('dates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data — seeded from props so guests arriving from /lodging keep
  // their date + guest selection.
  const [checkIn, setCheckIn] = useState<Date | undefined>(() => parseDate(initialCheckIn));
  const [checkOut, setCheckOut] = useState<Date | undefined>(() => parseDate(initialCheckOut));
  const [numGuests, setNumGuests] = useState(() => {
    const seeded = initialGuests ?? 1;
    const max = unit.maxGuests || seeded;
    return Math.max(1, Math.min(seeded, max));
  });
  const [numPets, setNumPets] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Calculate pricing
  const numNights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const basePrice = unit.basePrice || 0;
  const cleaningFee = unit.cleaningFee || 0;
  const baseGuests = unit.baseGuests ?? unit.maxGuests;
  const extraGuestFee = unit.extraGuestFee || 0;
  const petFee = unit.petFee || 0;

  const extraGuests = Math.max(0, numGuests - baseGuests);
  const extraGuestsTotal = extraGuests * extraGuestFee * numNights;
  const petsTotal = unit.petsAllowed ? numPets * petFee : 0;
  const nightlySubtotal = numNights * basePrice;
  const total = nightlySubtotal + extraGuestsTotal + cleaningFee + petsTotal;

  // Validation
  const canProceedToDates = checkIn && checkOut && numNights >= (unit.minStay || 1);
  const canProceedToPayment =
    canProceedToDates &&
    guestName &&
    guestEmail &&
    numGuests > 0 &&
    numGuests <= unit.maxGuests &&
    (!unit.petsAllowed || numPets <= (unit.maxPets ?? 0));

  const handleDateSelection = async () => {
    if (!checkIn || !checkOut) return;

    setLoading(true);
    setError(null);

    try {
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
    } catch {
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
          numPets,
          numNights,
          basePrice,
          cleaningFee,
          extraGuestsTotal,
          petsTotal,
          totalAmount: total * 100,
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

      router.push(`/booking/confirmation/${data.confirmationCode}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Booking failed. Please contact us.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'dates', label: 'Dates', number: 1 },
    { id: 'details', label: 'Details', number: 2 },
    { id: 'payment', label: 'Payment', number: 3 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-brand-sand overflow-hidden">
      {/* Header */}
      <div className="bg-brand-forest text-brand-cream p-6">
        <div className="font-serif text-2xl font-semibold mb-1">Book Your Stay</div>
        <div className="text-brand-sand/80 text-sm">{unit.name}</div>
      </div>

      <div className="p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  step === s.id 
                    ? 'bg-brand-copper text-brand-cream' 
                    : steps.findIndex(st => st.id === step) > index
                      ? 'bg-brand-sage text-brand-cream'
                      : 'bg-brand-sand/50 text-brand-stone'
                }`}>
                  {steps.findIndex(st => st.id === step) > index ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === s.id ? 'text-brand-forest' : 'text-brand-stone'
                }`}>
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 ${
                    steps.findIndex(st => st.id === step) > index
                      ? 'bg-brand-sage'
                      : 'bg-brand-sand/50'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Step 1: Date Selection */}
        {step === 'dates' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-serif text-xl font-semibold text-brand-forest mb-4">Select Your Dates</h3>

            <DatePicker
              unitId={unit._id}
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
            />

            {checkIn && checkOut && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 bg-brand-cream rounded-xl border border-brand-sand"
              >
                <div className="space-y-3">
                  <div className="flex justify-between text-brand-charcoal">
                    <span>${basePrice} × {numNights} night{numNights !== 1 ? 's' : ''}</span>
                    <span className="font-semibold">${nightlySubtotal}</span>
                  </div>
                  {extraGuestsTotal > 0 && (
                    <div className="flex justify-between text-brand-charcoal">
                      <span>
                        Extra guests ({extraGuests} × ${extraGuestFee} × {numNights}{' '}
                        night{numNights !== 1 ? 's' : ''})
                      </span>
                      <span className="font-semibold">${extraGuestsTotal}</span>
                    </div>
                  )}
                  {petsTotal > 0 && (
                    <div className="flex justify-between text-brand-charcoal">
                      <span>
                        Pet fee ({numPets} × ${petFee})
                      </span>
                      <span className="font-semibold">${petsTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-charcoal">
                    <span>Cleaning fee</span>
                    <span className="font-semibold">${cleaningFee}</span>
                  </div>
                  <div className="border-t border-brand-sand pt-3">
                    <div className="flex justify-between">
                      <span className="font-serif font-bold text-brand-forest text-lg">Total</span>
                      <span className="font-serif font-bold text-brand-copper text-2xl">${total}</span>
                    </div>
                    {extraGuestFee > 0 && (
                      <p className="text-xs text-brand-stone mt-2">
                        Base price includes {baseGuests} guest{baseGuests !== 1 ? 's' : ''};
                        ${extraGuestFee}/night per additional guest.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleDateSelection}
              disabled={!canProceedToDates || loading}
              className="mt-6 w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking availability...
                </span>
              ) : 'Continue'}
            </button>

            {unit.minStay && unit.minStay > 1 && (
              <p className="mt-3 text-sm text-brand-stone text-center">
                Minimum stay: {unit.minStay} nights
              </p>
            )}
          </motion.div>
        )}

        {/* Step 2: Guest Details */}
        {step === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setStep('dates')}
              className="text-brand-copper hover:text-brand-copper-dark text-sm mb-4 inline-flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to dates
            </button>

            <h3 className="font-serif text-xl font-semibold text-brand-forest mb-4">Guest Information</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brand-forest mb-2">
                  Number of Guests *
                </label>
                <GuestSelector
                  value={numGuests}
                  onChange={setNumGuests}
                  max={unit.maxGuests}
                />
                {extraGuestFee > 0 && (
                  <p className="mt-2 text-xs text-brand-stone">
                    Base price includes {baseGuests} guest{baseGuests !== 1 ? 's' : ''}.
                    ${extraGuestFee}/night per additional guest.
                  </p>
                )}
              </div>

              {unit.petsAllowed && (unit.maxPets ?? 0) > 0 && (
                <div>
                  <label className="block text-sm font-medium text-brand-forest mb-2">
                    Number of Pets
                  </label>
                  <GuestSelector
                    value={numPets}
                    onChange={setNumPets}
                    max={unit.maxPets ?? 0}
                    min={0}
                    singularLabel="pet"
                    pluralLabel="pets"
                  />
                  {petFee > 0 && (
                    <p className="mt-2 text-xs text-brand-stone">
                      ${petFee} per pet, per stay.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-forest mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-sand rounded-xl bg-brand-cream/50 focus:bg-white transition-colors"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-forest mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-sand rounded-xl bg-brand-cream/50 focus:bg-white transition-colors"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-forest mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-sand rounded-xl bg-brand-cream/50 focus:bg-white transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-forest mb-2">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-brand-sand rounded-xl bg-brand-cream/50 focus:bg-white transition-colors resize-none"
                  placeholder="Let us know if you have any special requests..."
                />
              </div>
            </div>

            <button
              onClick={() => setStep('payment')}
              disabled={!canProceedToPayment}
              className="mt-6 w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Continue to Payment
            </button>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setStep('details')}
              className="text-brand-copper hover:text-brand-copper-dark text-sm mb-4 inline-flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to details
            </button>

            <h3 className="font-serif text-xl font-semibold text-brand-forest mb-4">Payment</h3>

            {/* Booking Summary */}
            <div className="mb-6 p-5 bg-brand-cream rounded-xl border border-brand-sand">
              <h4 className="font-serif font-semibold text-brand-forest mb-4">{unit.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-stone">Check-in</span>
                  <span className="font-medium text-brand-charcoal">{checkIn?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-stone">Check-out</span>
                  <span className="font-medium text-brand-charcoal">{checkOut?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-stone">Guests</span>
                  <span className="font-medium text-brand-charcoal">{numGuests}</span>
                </div>
                {unit.petsAllowed && numPets > 0 && (
                  <div className="flex justify-between">
                    <span className="text-brand-stone">Pets</span>
                    <span className="font-medium text-brand-charcoal">{numPets}</span>
                  </div>
                )}
                <div className="border-t border-brand-sand pt-3 mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-brand-stone">
                      ${basePrice} × {numNights} night{numNights !== 1 ? 's' : ''}
                    </span>
                    <span className="font-medium text-brand-charcoal">${nightlySubtotal}</span>
                  </div>
                  {extraGuestsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-brand-stone">Extra guests</span>
                      <span className="font-medium text-brand-charcoal">${extraGuestsTotal}</span>
                    </div>
                  )}
                  {petsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-brand-stone">Pet fee</span>
                      <span className="font-medium text-brand-charcoal">${petsTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-brand-stone">Cleaning fee</span>
                    <span className="font-medium text-brand-charcoal">${cleaningFee}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-brand-sand">
                    <span className="font-serif font-bold text-brand-forest">Total</span>
                    <span className="font-serif font-bold text-brand-copper text-xl">${total}</span>
                  </div>
                </div>
              </div>
            </div>

            <SquarePayment
              amount={total * 100}
              onSuccess={handlePaymentSuccess}
              onError={(err) => setError(err)}
              disabled={loading}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
