import type { RentalUnit } from '@/lib/sanity/schemas';

interface PricingDisplayProps {
  unit: RentalUnit;
}

export function PricingDisplay({ unit }: PricingDisplayProps) {
  const hasSeasonalPricing = unit.seasonalPricing && unit.seasonalPricing.length > 0;

  return (
    <div className="bg-white border-2 border-stone-200 rounded-lg p-6">
      {/* Base Price */}
      {unit.basePrice && unit.basePrice > 0 && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-stone-800">${unit.basePrice}</span>
            <span className="text-gray-600">/ night</span>
          </div>
          {!hasSeasonalPricing && (
            <p className="text-sm text-gray-500 mt-1">Base rate</p>
          )}
        </div>
      )}

      {/* Seasonal Pricing */}
      {hasSeasonalPricing && unit.seasonalPricing && (
        <div className="mb-4 pb-4 border-b border-stone-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Seasonal Rates</h4>
          <div className="space-y-2">
            {unit.seasonalPricing.map((season, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{season.season}</span>
                <span className="font-semibold text-stone-800">
                  ${season.pricePerNight}/night
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Fees */}
      <div className="space-y-2">
        {unit.cleaningFee && unit.cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cleaning fee</span>
            <span className="font-medium text-stone-800">${unit.cleaningFee}</span>
          </div>
        )}
        {unit.minStay && unit.minStay > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Minimum stay</span>
            <span className="font-medium text-stone-800">
              {unit.minStay} {unit.minStay === 1 ? 'night' : 'nights'}
            </span>
          </div>
        )}
      </div>

      {/* Pricing Note */}
      <div className="mt-4 pt-4 border-t border-stone-200">
        <p className="text-xs text-gray-500">
          Final price shown at checkout. Rates may vary by season and length of stay.
        </p>
      </div>
    </div>
  );
}
