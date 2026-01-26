import { sql } from './client';

export interface BookingInquiry {
  id?: string;
  created_at?: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  unit_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  num_adults?: number;
  num_children?: number;
  message?: string;
  special_requests?: string;
  referral_source?: string;
  status?: 'new' | 'contacted' | 'confirmed' | 'declined' | 'cancelled';
  admin_notes?: string;
  responded_at?: string;
}

export async function createBookingInquiry(inquiry: BookingInquiry) {
  const result = await sql`
    INSERT INTO booking_inquiries (
      guest_name, guest_email, guest_phone,
      unit_id, check_in, check_out,
      num_guests, num_adults, num_children,
      message, special_requests, referral_source
    )
    VALUES (
      ${inquiry.guest_name}, ${inquiry.guest_email}, ${inquiry.guest_phone},
      ${inquiry.unit_id}, ${inquiry.check_in}, ${inquiry.check_out},
      ${inquiry.num_guests}, ${inquiry.num_adults}, ${inquiry.num_children},
      ${inquiry.message}, ${inquiry.special_requests}, ${inquiry.referral_source}
    )
    RETURNING *
  `;

  return result[0];
}

export async function getBookingInquiries(status?: string) {
  if (status) {
    const result = await sql`
      SELECT * FROM booking_inquiries
      WHERE status = ${status}
      ORDER BY created_at DESC
    `;
    return result;
  }

  const result = await sql`
    SELECT * FROM booking_inquiries
    ORDER BY created_at DESC
  `;
  return result;
}

export async function updateInquiryStatus(
  id: string,
  status: string,
  notes?: string
) {
  const result = await sql`
    UPDATE booking_inquiries
    SET
      status = ${status},
      admin_notes = ${notes},
      responded_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  return result[0];
}
