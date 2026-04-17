# Database Alternatives Summary

You have **3 options** for storing booking inquiries, contact submissions, and newsletter subscriptions:

---

## ⭐ Option 1: Neon (RECOMMENDED - Currently Configured)

**Status:** ✅ Already set up in the code

**Why choose this:**
- Generous free tier (3 GB storage)
- No credit card required  
- Standard PostgreSQL (easy to migrate later)
- Auto-suspends when idle
- Fast serverless architecture

**Setup time:** 5 minutes

**Follow:** NEON-SETUP.md

---

## Option 2: Use Sanity for Everything

**Why choose this:**
- Simplest option - no separate database
- View all data in Sanity Studio
- One less service to manage
- Good for low-volume sites

**Drawbacks:**
- Sanity is content-focused, not database-focused
- Less ideal for high-volume transactional data
- Counts against Sanity document limits

**Setup time:** 15 minutes (need to add schemas)

**How to switch:**
1. Add booking inquiry and contact schemas to Sanity
2. Update form submission to use Sanity client
3. Remove DATABASE_URL from .env.local

---

## Option 3: PlanetScale (MySQL)

**Why choose this:**
- 5 GB free tier
- Branches for development
- MySQL instead of Postgres

**Setup:**
```bash
npm install @planetscale/database
```

Update connection in `src/lib/db/client.ts`

---

## Option 4: Railway

**Why choose this:**
- $5 free credit monthly
- Postgres, MySQL, MongoDB support
- Easy deploy

**Setup:**
Sign up at railway.app, create Postgres database

---

## Current Setup (Neon)

The project is configured for Neon by default:

**Files using Neon:**
- `src/lib/db/client.ts` - Database client
- `src/lib/db/inquiries.ts` - Booking functions  
- `src/lib/db/contact.ts` - Contact functions

**Environment variable needed:**
```bash
DATABASE_URL=postgresql://...
```

**To switch:** Just follow a different setup guide and update the client!

---

## Recommendation

**Stick with Neon** - it's already configured, has a great free tier, and requires no credit card.

If you want absolute simplicity and expect low volume (< 100 inquiries/month), consider using Sanity for everything.
