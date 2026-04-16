# Database Setup Guide

You have **three options** for storing booking inquiries and contact submissions. Choose the one that works best for you:

---

## ⭐ Option 1: Vercel Postgres (RECOMMENDED)

**Best for:** Easiest setup, integrated with Vercel deployment

### Setup Steps

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Link your project**:
```bash
vercel link
```

4. **Create Postgres database**:
   - Go to https://vercel.com/dashboard
   - Click on your project
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name like "dillardmill-db"
   - Click "Create"

5. **Pull environment variables**:
```bash
vercel env pull .env.local
```

This automatically adds:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

6. **Create tables**:
```bash
# The tables will be created automatically when you deploy
# Or run migrations locally (see SQL below)
```

### SQL Schema (run in Vercel dashboard SQL tab):

```sql
-- Booking Inquiries
CREATE TABLE IF NOT EXISTS booking_inquiries (
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

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON booking_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_dates ON booking_inquiries(check_in, check_out);

-- Contact Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
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

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active'
);
```

### Environment Variables (.env.local):

```bash
# Vercel Postgres (auto-added by `vercel env pull`)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
```

**✅ Done!** No other configuration needed.

---

## Option 2: Neon (Best Free Tier)

**Best for:** Generous free tier (3 GB), serverless Postgres

### Setup Steps

1. **Install Neon package**:
```bash
npm install @neondatabase/serverless
```

2. **Create Neon account**:
   - Go to https://neon.tech
   - Sign up (free)
   - Create new project: "dillardmill"
   - Copy connection string

3. **Update database client**:

Edit `src/lib/db/client.ts`:
```typescript
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);
```

4. **Add to .env.local**:
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
```

5. **Run SQL migrations**:
   - Use same SQL schema as Option 1
   - Run in Neon's SQL Editor

**✅ Done!**

---

## Option 3: Use Sanity for Everything (Simplest)

**Best for:** Minimal complexity, one service for everything

Instead of a separate database, store inquiries and contacts directly in Sanity CMS!

### Setup Steps

1. **Add new Sanity schemas**:

Create `sanity/schemas/documents/bookingInquiry.ts`:
```typescript
import { defineType } from 'sanity';

export default defineType({
  name: 'bookingInquiry',
  title: 'Booking Inquiries',
  type: 'document',
  fields: [
    {
      name: 'guestName',
      title: 'Guest Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'guestEmail',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'guestPhone',
      title: 'Phone',
      type: 'string',
    },
    {
      name: 'unit',
      title: 'Unit',
      type: 'reference',
      to: [{ type: 'rentalUnit' }],
    },
    {
      name: 'checkIn',
      title: 'Check-in Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'checkOut',
      title: 'Check-out Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'numGuests',
      title: 'Number of Guests',
      type: 'number',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'message',
      title: 'Message',
      type: 'text',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Declined', value: 'declined' },
        ],
      },
      initialValue: 'new',
    },
    {
      name: 'adminNotes',
      title: 'Admin Notes',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'guestName',
      subtitle: 'guestEmail',
      checkIn: 'checkIn',
      status: 'status',
    },
    prepare({ title, subtitle, checkIn, status }) {
      return {
        title,
        subtitle: `${subtitle} - ${checkIn} (${status})`,
      };
    },
  },
});
```

2. **Add to schema index**:

Update `sanity/schemas/index.ts`:
```typescript
import bookingInquiry from './documents/bookingInquiry';
import contactSubmission from './documents/contactSubmission';

export const schemaTypes = [
  // ... existing schemas
  bookingInquiry,
  contactSubmission,
];
```

3. **Update inquiry submission**:

Create `src/lib/sanity/inquiries.ts`:
```typescript
import { client } from './client';

export async function createBookingInquiry(data: any) {
  return client.create({
    _type: 'bookingInquiry',
    guestName: data.guest_name,
    guestEmail: data.guest_email,
    guestPhone: data.guest_phone,
    unit: { _type: 'reference', _ref: data.unit_id },
    checkIn: data.check_in,
    checkOut: data.check_out,
    numGuests: data.num_guests,
    message: data.message,
    status: 'new',
  });
}
```

**Benefits:**
- ✅ No separate database service
- ✅ View inquiries in Sanity Studio
- ✅ Same authentication as content
- ✅ One less service to manage

**Drawbacks:**
- ❌ Not ideal for high-volume transactional data
- ❌ Sanity is content-focused, not database-focused

**✅ Done!** All data in one place.

---

## Comparison Table

| Feature | Vercel Postgres | Neon | Sanity Only |
|---------|----------------|------|-------------|
| **Setup** | Easiest | Easy | Very Easy |
| **Free Tier** | 256 MB | 3 GB | 10k docs |
| **Scalability** | Excellent | Excellent | Good |
| **Use Case** | Best for production | Best free tier | Best for simplicity |
| **Cost** | Pay as you grow | Free tier generous | Included with Sanity |
| **Integration** | Built into Vercel | Standalone | No extra service |

---

## My Recommendation

**For you:** Use **Vercel Postgres**

**Why:**
1. You'll deploy to Vercel anyway
2. Zero-config integration
3. Automatic environment variables
4. Free tier is sufficient for this project
5. Easy to scale later

**Alternative:** If you want the simplest setup and low volume, use **Sanity for everything** (Option 3).

---

## Current Code Status

The project is already set up for Vercel Postgres (Option 1). Files updated:

- ✅ `src/lib/db/client.ts` - Database client
- ✅ `src/lib/db/inquiries.ts` - Booking functions
- ✅ `src/lib/db/contact.ts` - Contact functions

Just follow the setup steps above and you're ready!

---

## Need to Switch?

If you want to use Neon or Sanity instead, let me know and I'll update the code!
