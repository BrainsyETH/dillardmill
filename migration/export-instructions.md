# Squarespace Export Instructions

**Time needed:** 15-30 minutes

## Step 1: Export Your Squarespace Site

### Option A: WordPress Export (Recommended)

1. Log in to your Squarespace account
2. Go to **Settings → Advanced → Import/Export**
3. Click **Export** in the WordPress section
4. Click **Start Export**
5. Wait for email with download link (usually 5-15 minutes)
6. Download the XML file when you receive the email
7. Save it as: `squarespace-export.xml`

### Option B: Manual Content Gathering

If export doesn't work, we'll manually copy content:
- Take screenshots of each page
- Copy text content to a Google Doc
- Download images manually

## Step 2: Download All Images

### Method 1: Bulk Download (Best)

1. Go to **Design → Custom CSS**
2. Paste this code temporarily:
```css
/* This will list all images - copy URLs */
body::after {
  content: "Check browser console for image URLs";
}
```
3. Open browser console (F12)
4. Run this JavaScript:
```javascript
// Get all image URLs
let images = Array.from(document.querySelectorAll('img')).map(img => img.src);
console.log('Image URLs:', images);
copy(images.join('\n')); // Copies to clipboard
```

### Method 2: Manual Download

1. Go to **Pages → Not Linked**
2. Check if there's a "Media" or "Gallery" section
3. Download images from there

OR

1. Visit each page on your live site
2. Right-click images → Save As
3. Organize by page/unit

## Step 3: Document Your Content

Create a simple inventory - I'll help you organize it into the right format.

**What to capture:**

For each rental unit:
- Unit name
- Description
- Price per night
- Number of bedrooms/bathrooms
- Maximum guests
- Amenities list
- All image URLs or files
- Airbnb/VRBO links

Just gather this info however is easiest (screenshots, copy-paste, etc.)

---

## What to Send Me

Once you have:
1. ✅ Squarespace XML export (if available)
2. ✅ Downloaded images (in a folder)
3. ✅ Any notes/screenshots about your rentals

Let me know and I'll create scripts to:
- Parse the XML automatically
- Generate Sanity import files
- Bulk upload images
- Migrate everything in minutes

---

## Quick Questions to Answer Now:

1. How many rental units do you have?
2. Are they currently live on Squarespace?
3. What's your Squarespace site URL? (so I can see the structure)

This helps me prepare the right migration scripts!
