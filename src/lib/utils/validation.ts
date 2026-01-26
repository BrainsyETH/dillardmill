import { z } from 'zod';

export const bookingInquirySchema = z.object({
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_email: z.string().email('Invalid email address'),
  guest_phone: z.string().optional(),
  unit_id: z.string().min(1, 'Please select a unit'),
  check_in: z.string().min(1, 'Check-in date is required'),
  check_out: z.string().min(1, 'Check-out date is required'),
  num_guests: z.number().min(1, 'At least 1 guest is required'),
  num_adults: z.number().optional(),
  num_children: z.number().optional(),
  message: z.string().optional(),
  special_requests: z.string().optional(),
  referral_source: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});
