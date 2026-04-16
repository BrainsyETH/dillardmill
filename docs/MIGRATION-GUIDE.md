# Squarespace to Next.js Migration Guide

## Critical: Data Preservation

The most important goal of this migration is to **preserve all existing listing/unit data** without any loss. Follow this guide carefully to ensure a smooth transition.

## Pre-Migration Checklist

### 1. Backup Everything from Squarespace

- [ ] Export all pages (File > Export)
- [ ] Download all blog posts (Settings > Advanced > Import/Export)
- [ ] Save all images (bulk download from Media Library)
- [ ] Screenshot all rental unit pages
- [ ] Copy all text content to Google Docs
- [ ] Document current URL structure
- [ ] Save all custom code/scripts
- [ ] Export contact form submissions (if any)
- [ ] Save analytics data

### 2. Create Data Inventory Spreadsheet

Create a spreadsheet with columns:

**Rental Units Sheet:**
- Unit Name
- URL Slug
- Short Description
- Full Description
- Base Price
- Cleaning Fee
- Min Stay
- Max Guests
- Bedrooms
- Bathrooms
- Bed Types & Counts
- Amenities (comma-separated)
- Airbnb URL
- VRBO URL
- Featured (Yes/No)
- Image URLs (numbered)

**Blog Posts Sheet:**
- Title
- URL Slug
- Author
- Date Published
- Excerpt
- Full Content
- Categories
- Cover Image URL

**Reviews Sheet:**
- Guest Name
- Date
- Rating (1-5)
- Review Text
- Stay Date
- Unit Name
- Source (Airbnb/VRBO/Direct)

## Phase 1: Environment Setup

### 1. Set Up Sanity CMS

```bash
# Already initialized in the project

# Now create a Sanity account and project:
# 1. Go to https://www.sanity.io/
# 2. Sign up (free tier is sufficient)
# 3. Create new project: "Dillard Mill"
# 4. Note your Project ID
# 5. Create dataset: "production"
# 6. Generate token with Editor permissions
```

Add to `.env.local`:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...your-token
```

### 2. Set Up Supabase

```bash
# 1. Go to https://supabase.com
# 2. Create new project: "dillardmill"
# 3. Wait for setup to complete (2-3 minutes)
# 4. Go to Settings > API
# 5. Copy Project URL and anon key
```

Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Run SQL to create tables (in Supabase SQL Editor):
```sql
-- See implementation plan for full SQL
-- Creates: booking_inquiries, contact_submissions, newsletter_subscribers
```

## Phase 2: Content Migration

### Step 1: Migrate Amenities First

Amenities are referenced by rental units, so create them first.

1. Go to http://localhost:3000/studio
2. Click "Amenities"
3. Create all amenities:
   - WiFi (icon: wifi, category: general)
   - Hot Tub (icon: hot-tub, category: outdoor)
   - Fire Pit (icon: fire-pit, category: outdoor)
   - Full Kitchen (icon: kitchen, category: kitchen)
   - etc.

### Step 2: Migrate Rental Units

For each unit in your spreadsheet:

1. Click "Rental Units" > "Create new Rental Unit"
2. Fill in all fields carefully:
   - **Name**: Exact match from Squarespace
   - **Slug**: Same as current URL (e.g., "pine-valley-cabin")
   - **Short Description**: Copy from your notes
   - **Full Description**: Paste and format
   - **Pricing**: Base price, seasonal rates, cleaning fee
   - **Guests/Beds/Baths**: Match exactly
   - **Amenities**: Select from list created earlier
   - **Images**: Upload in same order as Squarespace
     - Mark one as "Featured Image"
     - Add alt text to each
     - Add captions if present
   - **Booking Links**: Airbnb and VRBO URLs
   - **Available**: Check to make visible
   - **Featured**: Check if shown on homepage
   - **SEO**: Copy meta title and description

3. **Verify Before Publishing**:
   - All fields filled correctly
   - Images uploaded and display properly
   - Pricing matches Squarespace
   - Amenities complete
   - Links work

4. Click "Publish"

### Step 3: Data Verification

After migrating all units, verify:

```bash
# Create a verification checklist:
```

- [ ] Unit count matches (X units on Squarespace = X units in Sanity)
- [ ] All unit names identical
- [ ] All descriptions complete
- [ ] All pricing accurate
- [ ] All images present (count should match)
- [ ] All amenities listed
- [ ] All external links work
- [ ] SEO metadata preserved

### Step 4: Migrate Blog Posts

1. Click "Authors" > Create author profiles
2. Click "Blog Categories" > Create categories
3. Click "Blog Posts" > Create each post:
   - Title, slug, date
   - Author reference
   - Categories
   - Excerpt and body
   - Cover image
   - SEO settings

### Step 5: Migrate Reviews

1. Click "Reviews"
2. For each review:
   - Guest name
   - Date and rating
   - Review text
   - Link to unit (if specific)
   - Source (Airbnb/VRBO/etc.)
   - Check "Verified"
   - Check "Featured" for best reviews

### Step 6: Add Local Attractions

1. Create "Attraction Categories":
   - Historic Sites
   - Hiking & Nature
   - Dining
   - Shopping
   - Entertainment

2. Create attractions:
   - Dillard Mill (distance: 0.1 miles)
   - Nearby trails
   - Restaurants
   - Points of interest

### Step 7: Configure Site Settings

1. Click "Site Settings"
2. Fill in:
   - Site name and tagline
   - Logo (upload)
   - Contact info (email, phone, address)
   - Navigation menu structure
   - Footer columns and links
   - Social media URLs
   - Airbnb/VRBO profile URLs
   - Booking notice text
   - Default SEO settings

## Phase 3: URL Redirects

To preserve SEO, set up 301 redirects for any changed URLs.

In `next.config.ts`, add:

```typescript
async redirects() {
  return [
    {
      source: '/old-cabin-name',
      destination: '/units/new-cabin-slug',
      permanent: true,
    },
    {
      source: '/blog/old-post-slug',
      destination: '/blog/new-post-slug',
      permanent: true,
    },
    // Add all URL changes
  ];
}
```

## Phase 4: Testing

### Pre-Launch Testing Checklist

- [ ] **Content Accuracy**
  - [ ] All units display correctly
  - [ ] All images load
  - [ ] All text matches Squarespace
  - [ ] Pricing accurate

- [ ] **Functionality**
  - [ ] Navigation works on all pages
  - [ ] Mobile menu functions
  - [ ] All internal links work
  - [ ] All external links work (Airbnb, VRBO)
  - [ ] Gallery loads and lightbox works

- [ ] **SEO**
  - [ ] Page titles correct
  - [ ] Meta descriptions present
  - [ ] OG images set
  - [ ] Structured data valid
  - [ ] Sitemap generated

- [ ] **Performance**
  - [ ] Lighthouse score >90
  - [ ] Images optimized
  - [ ] Fast page loads
  - [ ] No console errors

- [ ] **Cross-Browser**
  - [ ] Chrome
  - [ ] Safari
  - [ ] Firefox
  - [ ] Mobile Safari
  - [ ] Mobile Chrome

- [ ] **Responsive Design**
  - [ ] Desktop (1920px)
  - [ ] Laptop (1366px)
  - [ ] Tablet (768px)
  - [ ] Mobile (375px)

## Phase 5: Launch

### Pre-Launch

1. **Parallel Run Period**
   - Keep Squarespace site active
   - Deploy Next.js site to staging URL
   - Test for 1-2 weeks
   - Collect feedback

2. **Final Verification**
   - Run through entire testing checklist again
   - Verify all data migrated correctly
   - Test booking inquiry form
   - Confirm email notifications work

### Launch Day

1. **DNS Update**
   - Update DNS to point to Vercel
   - Keep TTL low initially (300 seconds)
   - Monitor for issues

2. **Post-Launch Monitoring**
   - Watch analytics for traffic
   - Monitor error logs
   - Check contact form submissions
   - Respond quickly to any issues

3. **Keep Squarespace Backup**
   - Don't cancel Squarespace immediately
   - Keep active for 30 days as backup
   - After 30 days of successful operation, archive

## Rollback Plan

If critical issues arise:

1. Point DNS back to Squarespace
2. Investigate and fix issues
3. Re-test thoroughly
4. Re-launch when ready

## Data Integrity Verification Script

After migration, manually verify using this checklist:

```
Unit: [Unit Name]
✓ Name matches: ___________________
✓ Description complete: Yes / No
✓ Pricing correct: $_____ (matches $_____)
✓ Bedrooms: ___ (matches ___)
✓ Bathrooms: ___ (matches ___)
✓ Max Guests: ___ (matches ___)
✓ Image count: ___ (matches ___)
✓ Amenities: [List] (complete: Yes / No)
✓ Airbnb URL: Working / Broken / N/A
✓ VRBO URL: Working / Broken / N/A
✓ SEO title: Present / Missing
✓ SEO description: Present / Missing

Issues found:
_________________________________
_________________________________

Status: ✓ Verified | ⚠ Issues | ✗ Failed
```

## Support During Migration

If you encounter issues:

1. Check Sanity documentation: https://www.sanity.io/docs
2. Check Next.js documentation: https://nextjs.org/docs
3. Review implementation plan
4. Check GitHub issues

## Success Criteria

Migration is complete when:

- [ ] All rental units migrated with 100% data accuracy
- [ ] All images present and optimized
- [ ] All blog posts migrated
- [ ] All reviews added
- [ ] Site Settings configured
- [ ] SEO metadata complete
- [ ] All links functional
- [ ] Testing checklist 100% passed
- [ ] Site live and receiving traffic
- [ ] Contact forms working
- [ ] Analytics tracking active
- [ ] No data loss confirmed
