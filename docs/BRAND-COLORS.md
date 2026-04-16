# Pine Valley at Dillard Mill - Brand Colors & Design System

## 🎨 Primary Brand Colors

### Deep Brown / Espresso
**Usage:** Headings, accents, structural UI  
**Hex:** `#3A2A1E`  
**Evokes:** Wood, beams, mill history  

### Warm Off-White / Parchment
**Usage:** Primary page background tone  
**Hex:** `#F4F1EB`  
**Evokes:** Paper, comfort, reading ease  

### Muted Charcoal / Soft Black
**Usage:** Body text and contrast elements  
**Hex:** `#2B2B2B`  
**Evokes:** Readability, structure  

---

## 🌿 Secondary / Accent Colors

### Olive / Moss Green
**Usage:** Nature, outdoors, Missouri landscape  
**Hex:** `#6B7A5A`  

### Muted River Blue-Gray
**Usage:** Water, calm tone, subtle backgrounds  
**Hex:** `#6F8291`  

### Warm Tan / Sand / Aged Paper
**Usage:** Backgrounds, borders, vintage feel  
**Hex:** `#CBB8A3`  

### Rust / Copper Accent
**Usage:** Heritage, warmth, CTA highlights (buttons, links)  
**Hex:** `#9C5A3C`  

---

## 🪵 Brand Vibe

The palette communicates:
- ✅ **Historic / Vintage** - Rooted in mill heritage
- ✅ **Nature-Forward** - Missouri rivers & forests
- ✅ **Warm / Inviting** - Family-friendly, cozy lodging
- ✅ **Old-Mill Craftsmanship** - Quality, authenticity

---

## 🎭 Design Pairings

### Typography
- **Headings:** Serif or heritage-inspired fonts
  - Suggestions: Playfair Display, Merriweather, EB Garamond, Crimson Pro
- **Body:** Clean, readable sans-serif with warmth
  - Suggestions: Open Sans, Source Sans Pro, Inter, Lato

### Visual Style
- ✅ Weathered textures (wood grain, aged paper)
- ✅ Film-grain photography (vintage feel)
- ✅ Natural light photography (golden hour, soft shadows)
- ✅ Hand-drawn or rustic icons
- ✅ Subtle paper/canvas backgrounds

### Photography Tone
- Warm, slightly desaturated
- Natural lighting
- Earthy tones
- Candid, authentic moments
- Historic mill, creek, forest scenes

---

## 🎨 Tailwind Config Colors

```js
colors: {
  brand: {
    espresso: '#3A2A1E',
    parchment: '#F4F1EB',
    charcoal: '#2B2B2B',
    olive: '#6B7A5A',
    river: '#6F8291',
    sand: '#CBB8A3',
    rust: '#9C5A3C',
  },
  // Semantic naming
  primary: '#3A2A1E',      // espresso
  secondary: '#9C5A3C',    // rust/copper
  accent: '#6B7A5A',       // olive
  background: '#F4F1EB',   // parchment
  text: '#2B2B2B',         // charcoal
}
```

---

## 🔘 Button Styles

### Primary CTA (Book Now, Reserve)
- Background: `#9C5A3C` (rust/copper)
- Text: `#F4F1EB` (parchment)
- Hover: Darken 10% → `#7D4830`

### Secondary CTA (Learn More)
- Background: `#6B7A5A` (olive)
- Text: `#F4F1EB` (parchment)
- Hover: Darken 10% → `#556148`

### Ghost/Outline
- Border: `#3A2A1E` (espresso)
- Text: `#3A2A1E`
- Hover: Fill with espresso, text to parchment

---

## 📐 Usage Guidelines

### Backgrounds
- **Main:** `#F4F1EB` (parchment)
- **Alternate sections:** `#CBB8A3` (sand) for contrast
- **Dark sections:** `#3A2A1E` (espresso) with parchment text

### Text
- **Headings:** `#3A2A1E` (espresso)
- **Body:** `#2B2B2B` (charcoal)
- **Captions:** `#6B7A5A` (olive) or `#6F8291` (river)

### Links
- **Default:** `#9C5A3C` (rust)
- **Hover:** `#7D4830` (darker rust)
- **Visited:** `#6B7A5A` (olive)

### Borders & Dividers
- Light: `#CBB8A3` (sand)
- Medium: `#6B7A5A` (olive)
- Dark: `#3A2A1E` (espresso)

---

## 🖼️ Photo Filter Recommendations

To maintain brand consistency, apply to photos:
- **Warmth:** +10-15%
- **Saturation:** -5 to -10%
- **Contrast:** +5%
- **Highlights:** -5%
- **Shadows:** Lift +10% (soften)
- **Grain:** Add subtle film grain

---

Last updated: January 26, 2026
