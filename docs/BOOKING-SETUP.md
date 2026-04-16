# Square Booking System Setup Guide

This guide will help you set up the complete booking system with Square payment processing for Pine Valley.

## Table of Contents

1. [Square Account Setup](#square-account-setup)
2. [Resend Email Setup](#resend-email-setup)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Testing the System](#testing-the-system)
6. [Going Live](#going-live)

---

## 1. Square Account Setup

### Create Square Account

1. Go to [Square Developer Portal](https://developer.squareup.com/)
2. Sign up for a Square account (or log in if you have one)
3. Create a new application in the Developer Dashboard

### Get Your Credentials

#### Sandbox (Testing)
For development and testing:

1. Navigate to **Applications** in the Square dashboard
2. Click on your application
3. Go to the **Credentials** tab
4. You'll find:
   - **Sandbox Access Token** - Use this for `SQUARE_ACCESS_TOKEN`
   - **Sandbox Application ID** - Use this for `NEXT_PUBLIC_SQUARE_APPLICATION_ID`

5. Get your **Location ID**:
   - Go to **Locations** in the sidebar
   - Copy the Sandbox Location ID

#### Production
When ready to go live:

1. Same process as sandbox, but use **Production** credentials:
   - Production Access Token
   - Production Application ID
   - Production Location ID

### Test Cards (Sandbox Only)

Use these test cards in sandbox mode:

- **Successful Payment**: `4111 1111 1111 1111`
- **Declined**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiration**: Any future date
- **ZIP**: Any 5 digits

---

## 2. Resend Email Setup

### Create Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email

### Get API Key

1. Go to **API Keys** in dashboard
2. Click **Create API Key**
3. Name it "Pine Valley Production"
4. Copy the API key - this is your `RESEND_API_KEY`

### Add Your Domain

To send from `bookings@dillardmill.com`:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter `dillardmill.com`
4. Add the DNS records to your domain registrar:
   - Add the SPF, DKIM, and DMARC records provided
5. Wait for verification (usually 5-15 minutes)

**Note**: Until your domain is verified, emails will be sent from `onboarding@resend.dev`

---

## 3. Database Setup

### Create Bookings Table

Run this script to create the bookings table in your Neon database:

```bash
node -e "require('./src/lib/db/setup').setupDatabase()"
```

Or manually run the SQL:

```sql
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,

  unit_id TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INTEGER NOT NULL,
  num_nights INTEGER NOT NULL,

  base_price INTEGER NOT NULL,
  cleaning_fee INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,

  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,

  booking_status TEXT DEFAULT 'confirmed',

  special_requests TEXT,
  confirmation_code TEXT
);

CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_unit ON bookings(unit_id);
CREATE INDEX idx_bookings_email ON bookings(guest_email);
CREATE INDEX idx_bookings_confirmation ON bookings(confirmation_code);
```

---

## 4. Environment Variables

### Update `.env.local`

Add these variables to your `.env.local` file:

```bash
# Square
SQUARE_ACCESS_TOKEN=your_sandbox_access_token
SQUARE_LOCATION_ID=your_sandbox_location_id
NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_sandbox_app_id

# Resend
RESEND_API_KEY=re_your_api_key
ADMIN_EMAIL=pinevalley@dillardmill.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Vercel Environment Variables

When deploying to production:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add all variables from `.env.example`
4. Use **Production** Square credentials
5. Make sure to check "Production" environment

---

## 5. Testing the System

### Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to a unit page: `http://localhost:3000/units/cozy-cottage`

3. Click **"Book Now"**

4. Test the booking flow:
   - Select dates
   - Enter guest information
   - Use test card: `4111 1111 1111 1111`
   - Complete payment

5. Check:
   - ✅ Booking created in database
   - ✅ Confirmation email sent to guest
   - ✅ Admin notification email sent
   - ✅ Redirected to confirmation page

### Database Check

View bookings in your database:

```sql
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;
```

### Email Testing

- Check your inbox for confirmation email
- Check admin email for notification
- Verify all booking details are correct

---

## 6. Going Live

### Pre-Launch Checklist

- [ ] Switch to **Production** Square credentials
- [ ] Verify domain in Resend
- [ ] Test production payment with real card (then refund)
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Set all environment variables in Vercel
- [ ] Test full booking flow in production

### Production Square Setup

1. Complete Square account verification
2. Link your bank account
3. Get production credentials
4. Update environment variables:
   ```bash
   SQUARE_ACCESS_TOKEN=production_token
   SQUARE_LOCATION_ID=production_location
   NEXT_PUBLIC_SQUARE_APPLICATION_ID=production_app_id
   ```

### Square Payment Timeline

- **Immediate**: Guests are charged when booking
- **1-2 business days**: Funds appear in your Square balance
- **2-3 business days**: Funds transferred to your bank account

You can adjust the transfer schedule in Square dashboard settings.

---

## Features Included

### ✅ Booking System
- Real-time availability checking
- Date picker with blocked dates
- Guest information collection
- Special requests field

### ✅ Payment Processing
- Secure Square credit card processing
- PCI-compliant (Square handles card data)
- Automatic payment verification
- Support for all major cards

### ✅ Email Notifications
- Guest confirmation email with booking details
- Admin notification for new bookings
- Confirmation code generation
- Check-in instructions (can be customized)

### ✅ Confirmation Page
- Booking summary
- Confirmation code display
- Check-in instructions
- Contact information

### ✅ Database
- Booking storage
- Availability tracking
- Guest history
- Payment tracking

---

## Common Issues

### Square Payment Fails

**Issue**: "Payment not initialized"

**Solution**:
- Verify `NEXT_PUBLIC_SQUARE_APPLICATION_ID` is set
- Check browser console for errors
- Ensure you're using the correct environment (sandbox/production)

### Emails Not Sending

**Issue**: Emails not received

**Solution**:
- Check `RESEND_API_KEY` is correct
- Verify domain in Resend (or use default `onboarding@resend.dev`)
- Check spam folder
- View email logs in Resend dashboard

### Dates Not Blocking

**Issue**: Can book unavailable dates

**Solution**:
- Verify `bookings` table exists
- Check database connection
- Clear browser cache
- Check console for API errors

---

## Support

### Square Support
- Developer docs: https://developer.squareup.com/docs
- Support: https://squareup.com/help/us/en

### Resend Support
- Docs: https://resend.com/docs
- Discord: https://resend.com/discord

### Database (Neon)
- Docs: https://neon.tech/docs
- Support: https://neon.tech/docs/introduction/support

---

## Next Steps

After setting up bookings:

1. **Add Calendar Sync** - Export bookings to Google Calendar
2. **SMS Notifications** - Add Twilio for text confirmations
3. **Refund System** - Build cancellation/refund workflow
4. **Admin Dashboard** - View and manage bookings
5. **Dynamic Pricing** - Seasonal rates and special events

---

## Security Notes

- ✅ All payment data handled by Square (PCI compliant)
- ✅ Credit card details never touch your server
- ✅ Secure HTTPS required for production
- ✅ Environment variables never exposed to client
- ✅ Database credentials encrypted by Vercel

---

**Ready to accept bookings!** 🎉

For questions, contact development support or refer to the documentation links above.
