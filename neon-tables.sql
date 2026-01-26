-- Dillard Mill Database Tables
-- Run this in Neon SQL Editor: https://console.neon.tech

-- Booking Inquiries Table
CREATE TABLE booking_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  unit_id TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INTEGER NOT NULL,
  num_adults INTEGER,
  num_children INTEGER,
  message TEXT,
  special_requests TEXT,
  referral_source TEXT,
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_inquiries_status ON booking_inquiries(status);
CREATE INDEX idx_inquiries_dates ON booking_inquiries(check_in, check_out);

-- Contact Submissions Table
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  replied_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

CREATE INDEX idx_contact_status ON contact_submissions(status);

-- Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active'
);
