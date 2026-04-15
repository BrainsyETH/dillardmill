'use client';

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  singularLabel?: string;
  pluralLabel?: string;
}

export function GuestSelector({
  value,
  onChange,
  max,
  min = 1,
  singularLabel = 'guest',
  pluralLabel = 'guests',
}: GuestSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        −
      </button>

      <div className="flex-1 text-center">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="ml-2 text-gray-600">
          {value === 1 ? singularLabel : pluralLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        +
      </button>

      {max > 0 && (
        <div className="text-sm text-gray-500">
          Max: {max}
        </div>
      )}
    </div>
  );
}
