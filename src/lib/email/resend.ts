import { Resend } from 'resend';

// Lazy initialize to avoid build-time errors
let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendBookingConfirmation(booking: {
  id: string;
  guest_name: string;
  guest_email: string;
  unit_name: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_amount: number;
}) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'Pine Valley <bookings@dillardmill.com>',
      to: booking.guest_email,
      subject: `Booking Confirmation - ${booking.unit_name}`,
      html: `
        <h1>Your Pine Valley Booking is Confirmed!</h1>
        <p>Hi ${booking.guest_name},</p>
        <p>Thank you for booking with Pine Valley. We're excited to host you!</p>

        <h2>Booking Details</h2>
        <ul>
          <li><strong>Confirmation #:</strong> ${booking.id}</li>
          <li><strong>Unit:</strong> ${booking.unit_name}</li>
          <li><strong>Check-in:</strong> ${booking.check_in}</li>
          <li><strong>Check-out:</strong> ${booking.check_out}</li>
          <li><strong>Guests:</strong> ${booking.num_guests}</li>
          <li><strong>Total Paid:</strong> $${(booking.total_amount / 100).toFixed(2)}</li>
        </ul>

        <h2>What's Next?</h2>
        <p>You'll receive check-in instructions 48 hours before your arrival.</p>

        <h2>Property Address</h2>
        <p>
          126 Dillard Mill Road<br>
          Davisville, MO 65456
        </p>

        <p>Questions? Reply to this email or call us at (314) 843-4321.</p>

        <p>See you soon!<br>The Pine Valley Team</p>
      `,
    });

    // Also send notification to admin
    await getResend().emails.send({
      from: 'Pine Valley Bookings <bookings@dillardmill.com>',
      to: process.env.ADMIN_EMAIL || 'pinevalley@dillardmill.com',
      subject: `New Booking: ${booking.unit_name} - ${booking.guest_name}`,
      html: `
        <h1>New Booking Received</h1>
        <ul>
          <li><strong>Guest:</strong> ${booking.guest_name} (${booking.guest_email})</li>
          <li><strong>Unit:</strong> ${booking.unit_name}</li>
          <li><strong>Check-in:</strong> ${booking.check_in}</li>
          <li><strong>Check-out:</strong> ${booking.check_out}</li>
          <li><strong>Guests:</strong> ${booking.num_guests}</li>
          <li><strong>Amount:</strong> $${(booking.total_amount / 100).toFixed(2)}</li>
          <li><strong>Booking ID:</strong> ${booking.id}</li>
        </ul>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
