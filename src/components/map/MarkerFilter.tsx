'use client';

export type MarkerFilterValue = 'all' | 'units' | 'landmarks';

interface MarkerFilterProps {
  value: MarkerFilterValue;
  onChange: (value: MarkerFilterValue) => void;
  counts?: { units: number; landmarks: number };
  className?: string;
}

const OPTIONS: { id: MarkerFilterValue; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'units', label: 'Units' },
  { id: 'landmarks', label: 'Landmarks' },
];

export default function MarkerFilter({
  value,
  onChange,
  counts,
  className = '',
}: MarkerFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter map markers"
      className={`inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-1 ${className}`}
    >
      {OPTIONS.map((opt) => {
        const isActive = value === opt.id;
        const count =
          opt.id === 'units'
            ? counts?.units
            : opt.id === 'landmarks'
              ? counts?.landmarks
              : counts
                ? counts.units + counts.landmarks
                : undefined;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-brand-forest text-white'
                : 'text-brand-charcoal hover:bg-brand-sand/50'
            }`}
          >
            {opt.label}
            {typeof count === 'number' && (
              <span className={`ml-1.5 ${isActive ? 'text-white/80' : 'text-brand-stone'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
