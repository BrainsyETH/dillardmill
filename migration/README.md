# Content Migration Tools

This folder contains tools to help migrate your Squarespace content to Sanity CMS.

## Quick Start

### Option 1: I'll Do It For You (Easiest)

Just provide me with:
1. Your Squarespace site URL
2. Access to export (or exported XML file)
3. Any additional info about your rentals

I'll handle the rest!

### Option 2: Guided Migration

Follow these steps:

#### Step 1: Export from Squarespace

See `export-instructions.md` for detailed steps.

**Quick version:**
1. Squarespace → Settings → Advanced → Import/Export
2. Click "Export" (WordPress format)
3. Wait for email, download XML
4. Save as `squarespace-export.xml` in this folder

#### Step 2: Parse the Export

```bash
node parse-squarespace-xml.mjs
```

This will:
- Read your XML export
- Extract pages, posts, and images
- Save organized JSON files to `parsed/` folder

#### Step 3: Import to Sanity

```bash
node import-to-sanity.mjs
```

This will:
- Create amenities
- Create rental units
- Upload content to Sanity

#### Step 4: Upload Images

I'll help you bulk upload images once we have them organized.

---

## Files in This Folder

- **export-instructions.md** - How to export from Squarespace
- **parse-squarespace-xml.mjs** - Parses XML export
- **import-to-sanity.mjs** - Imports data to Sanity
- **README.md** - This file

---

## What I Need From You

To migrate your content, tell me:

1. **Squarespace URL:** What's your current site?
   - Example: https://yoursite.squarespace.com

2. **Number of Rentals:** How many units do you have?
   - Example: 3 cabins

3. **Access Method:**
   - Option A: You can export and share the XML
   - Option B: You give me details and I'll input them
   - Option C: Give me temporary access to export

4. **Image Location:**
   - Are images on Squarespace?
   - Do you have them locally?
   - Should I download them?

---

## Next Steps

Tell me your Squarespace URL and I'll:
1. Analyze the current site structure
2. Create custom import scripts for your exact setup
3. Help you export or do it for you
4. Migrate everything to Sanity

**Just say:** "My Squarespace site is [URL]" and I'll take it from there!
