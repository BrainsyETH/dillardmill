# Neon Database Setup (5 Minutes)

**Neon** is a serverless Postgres database with an excellent free tier perfect for this project.

## Why Neon?

✅ **Generous Free Tier**
- 3 GB storage
- 5 projects
- Unlimited queries
- Auto-suspend when idle (saves resources)

✅ **Modern & Fast**
- Serverless architecture
- Branches for development
- Built-in connection pooling
- 50ms cold starts

✅ **Easy Setup**
- No credit card required
- 2-minute setup
- One connection string

---

## Setup Steps

### 1. Create Neon Account

1. Go to https://neon.tech
2. Click "Sign Up" (free - no credit card!)
3. Sign up with GitHub, Google, or email

### 2. Create Project

1. Click "Create Project"
2. **Project Name:** dillardmill
3. **Postgres Version:** 16 (latest)
4. **Region:** Choose closest to you (e.g., US East, EU West)
5. Click "Create Project"

Wait 30 seconds for it to provision...

### 3. Get Connection String

1. You'll see a connection string like:
```
postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb
```

2. Copy this entire string!

### 4. Add to Environment Variables

Open `/Users/brainsy/clawd/dillardmill/.env.local` and add:

```bash
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb
```

**Important:** Replace with YOUR actual connection string from step 3!

### 5. Create Tables

1. In Neon dashboard, click "SQL Editor"
2. Paste this SQL and click "Run":

```sql
-- Booking Inquiries
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

-- Contact Submissions
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

-- Newsletter Subscribers
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active'
);
```

3. You should see: "Success! 3 commands completed"

### 6. Test Connection

Restart your dev server:
```bash
# Kill the old server (Ctrl+C or)
npm run dev
```

---

## ✅ You're Done!

Your database is ready! The code will automatically:
- Connect to Neon when forms are submitted
- Store booking inquiries
- Store contact submissions
- Manage newsletter subscriptions

---

## View Your Data

**In Neon Dashboard:**
1. Go to https://neon.tech
2. Click your project
3. Click "Tables" to browse data
4. Click "SQL Editor" to run queries

**Example queries:**
```sql
-- See all booking inquiries
SELECT * FROM booking_inquiries ORDER BY created_at DESC;

-- See new inquiries only
SELECT * FROM booking_inquiries WHERE status = 'new';

-- Count total inquiries
SELECT COUNT(*) FROM booking_inquiries;
```

---

## Free Tier Limits

You get (free forever):
- ✅ 3 GB storage (plenty for thousands of inquiries)
- ✅ 5 projects
- ✅ Unlimited queries
- ✅ Auto-suspend after 5 min idle
- ✅ 100 hours compute per month (resets monthly)

**Will this be enough?**
Yes! For a vacation rental site, you'll likely get:
- ~10-50 inquiries/month = ~600 rows/year
- Each row is ~1 KB
- Total: Less than 1 MB even after years

You're well within the free tier limits!

---

## Next Steps

1. ✅ Neon database set up
2. ⏳ Set up Sanity CMS (see QUICK-START.md)
3. ⏳ Begin content migration

---

## Troubleshooting

**Error: "connection timeout"**
- Check that DATABASE_URL is correct in .env.local
- Make sure you copied the entire connection string
- Restart your dev server

**Error: "SSL connection required"**
- Neon requires SSL by default (already configured in code)
- No action needed

**Tables not showing up**
- Make sure you ran all the SQL in step 5
- Check "Tables" tab in Neon dashboard
- Should see: booking_inquiries, contact_submissions, newsletter_subscribers

---

**Database ready!** Now you can accept bookings and contact form submissions. 🎉
