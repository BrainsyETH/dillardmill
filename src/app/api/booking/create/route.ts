import { NextRequest, NextResponse } from 'next/server';
import { createBooking, checkAvailability } from '@/lib/db/bookings';
import { sendBookingConfirmation } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();

    const {
      unitId,
      unitName,
      checkIn,
      checkOut,
      numGuests,
      numNights,
      basePrice,
      cleaningFee,
      totalAmount,
      paymentId,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
    } = bookingData;

    // Validate required fields
    if (!unitId || !unitName || !checkIn || !checkOut || !numGuests || !numNights || !totalAmount || !paymentId || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Double-check availability
    const available = await checkAvailability(unitId, checkIn, checkOut);
    if (!available) {
      return NextResponse.json(
        { error: 'Dates are no longer available' },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await createBooking({
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      unit_id: unitId,
      unit_name: unitName,
      check_in: checkIn,
      check_out: checkOut,
      num_guests: numGuests,
      num_nights: numNights,
      base_price: basePrice,
      cleaning_fee: cleaningFee,
      total_amount: totalAmount,
      payment_id: paymentId,
      payment_status: 'paid',
      payment_method: 'square',
      booking_status: 'confirmed',
      special_requests: specialRequests,
    });

    // Send confirmation email
    await sendBookingConfirmation({
      id: booking.confirmation_code,
      guest_name: guestName,
      guest_email: guestEmail,
      unit_name: unitName,
      check_in: checkIn,
      check_out: checkOut,
      num_guests: numGuests,
      total_amount: totalAmount,
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      confirmationCode: booking.confirmation_code,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
