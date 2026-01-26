/**
 * Pine Valley Brand Colors Reference
 * View this component to see all brand colors in action
 * Usage: import in any page to display the color palette
 */

export default function BrandColors() {
  const colors = [
    {
      name: 'Espresso',
      hex: '#3A2A1E',
      var: '--color-espresso',
      usage: 'Headings, accents, structural UI',
      category: 'Primary'
    },
    {
      name: 'Parchment',
      hex: '#F4F1EB',
      var: '--color-parchment',
      usage: 'Primary background tone',
      category: 'Primary'
    },
    {
      name: 'Charcoal',
      hex: '#2B2B2B',
      var: '--color-charcoal',
      usage: 'Body text, contrast elements',
      category: 'Primary'
    },
    {
      name: 'Olive / Moss Green',
      hex: '#6B7A5A',
      var: '--color-olive',
      usage: 'Nature, outdoors, Missouri landscape',
      category: 'Secondary'
    },
    {
      name: 'River Blue-Gray',
      hex: '#6F8291',
      var: '--color-river',
      usage: 'Water, calm tone, subtle backgrounds',
      category: 'Secondary'
    },
    {
      name: 'Sand / Aged Paper',
      hex: '#CBB8A3',
      var: '--color-sand',
      usage: 'Backgrounds, borders, vintage feel',
      category: 'Secondary'
    },
    {
      name: 'Rust / Copper',
      hex: '#9C5A3C',
      var: '--color-rust',
      usage: 'Heritage, warmth, CTA highlights',
      category: 'Secondary'
    }
  ];

  const primary = colors.filter(c => c.category === 'Primary');
  const secondary = colors.filter(c => c.category === 'Secondary');

  return (
    <div className="p-8 bg-brand">
      <h1 className="text-4xl font-bold text-brand mb-2">
        Pine Valley Brand Colors
      </h1>
      <p className="text-[var(--color-river)] mb-8">
        Rustic, historic mill / riverside / heritage aesthetic
      </p>

      {/* Primary Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-brand mb-4">
          🎨 Primary Brand Colors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primary.map((color) => (
            <div key={color.name} className="border border-[var(--color-sand)] rounded-lg overflow-hidden shadow-sm">
              <div
                className="h-32"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-4 bg-white">
                <h3 className="font-bold text-lg text-[var(--color-espresso)] mb-1">
                  {color.name}
                </h3>
                <p className="text-sm font-mono text-[var(--color-river)] mb-2">
                  {color.hex}
                </p>
                <p className="text-sm text-[var(--color-charcoal)] mb-1">
                  {color.usage}
                </p>
                <code className="text-xs text-[var(--color-olive)] bg-[var(--color-parchment)] px-2 py-1 rounded">
                  var({color.var})
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-brand mb-4">
          🌿 Secondary / Accent Colors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {secondary.map((color) => (
            <div key={color.name} className="border border-[var(--color-sand)] rounded-lg overflow-hidden shadow-sm">
              <div
                className="h-24"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-4 bg-white">
                <h3 className="font-bold text-base text-[var(--color-espresso)] mb-1">
                  {color.name}
                </h3>
                <p className="text-xs font-mono text-[var(--color-river)] mb-2">
                  {color.hex}
                </p>
                <p className="text-xs text-[var(--color-charcoal)]">
                  {color.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Button Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-brand mb-4">
          🔘 Button Examples
        </h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">
            Book Now (Primary CTA)
          </button>
          <button className="btn-secondary">
            Learn More (Secondary)
          </button>
          <button 
            className="px-6 py-3 border-2 rounded transition-all hover:bg-[var(--color-espresso)] hover:text-[var(--color-parchment)]"
            style={{ 
              borderColor: 'var(--color-espresso)', 
              color: 'var(--color-espresso)' 
            }}
          >
            Ghost Button
          </button>
        </div>
      </section>

      {/* Typography Examples */}
      <section>
        <h2 className="text-2xl font-semibold text-brand mb-4">
          ✍️ Typography Examples
        </h2>
        <div className="space-y-4 bg-white p-6 rounded-lg border border-[var(--color-sand)]">
          <h1 className="text-4xl font-bold text-[var(--color-espresso)]">
            Heading 1 - Espresso (#3A2A1E)
          </h1>
          <h2 className="text-3xl font-semibold text-[var(--color-espresso)]">
            Heading 2 - Espresso
          </h2>
          <h3 className="text-2xl font-medium text-[var(--color-espresso)]">
            Heading 3 - Espresso
          </h3>
          <p className="text-base text-[var(--color-charcoal)]">
            Body text in charcoal (#2B2B2B). Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            This is the standard text color used throughout the site for maximum readability against 
            the parchment background.
          </p>
          <p className="text-sm text-[var(--color-river)]">
            Caption or secondary text in river blue-gray (#6F8291). Perfect for dates, 
            metadata, and less prominent information.
          </p>
          <a href="#" className="text-[var(--color-rust)] hover:underline font-semibold">
            Link example in rust/copper (#9C5A3C)
          </a>
        </div>
      </section>

      {/* Usage Note */}
      <div className="mt-12 p-6 bg-[var(--color-sand)] rounded-lg">
        <h3 className="text-lg font-bold text-[var(--color-espresso)] mb-2">
          💡 Usage in Code
        </h3>
        <p className="text-sm text-[var(--color-charcoal)] mb-4">
          All colors are available as CSS variables. Use them like this:
        </p>
        <pre className="bg-white p-4 rounded text-xs overflow-x-auto">
{`<!-- Using CSS variables -->
<div style="color: var(--color-espresso)">Text</div>

<!-- Using Tailwind classes -->
<div className="bg-brand text-brand">Content</div>

<!-- Using utility classes -->
<button className="btn-primary">Book Now</button>

<!-- Direct hex values -->
<div className="text-[#3A2A1E]">Espresso text</div>`}
        </pre>
      </div>
    </div>
  );
}
