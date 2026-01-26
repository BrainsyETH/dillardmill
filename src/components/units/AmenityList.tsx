interface Amenity {
  _id?: string;
  name: string;
  icon?: string;
  category?: string;
  description?: string;
}

interface AmenityListProps {
  amenities: Amenity[];
}

export function AmenityList({ amenities }: AmenityListProps) {
  // Group amenities by category
  const grouped = amenities.reduce((acc, amenity) => {
    const category = amenity.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  const categories = Object.keys(grouped).sort();

  if (categories.length === 0) {
    return (
      <div className="text-gray-500">No amenities listed</div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="font-semibold text-lg mb-3 text-stone-800">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {grouped[category].map((amenity, index) => (
              <div
                key={amenity._id || index}
                className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg"
                title={amenity.description}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {amenity.icon ? (
                    <span className="text-stone-700">{amenity.icon}</span>
                  ) : (
                    <span className="text-stone-700">✓</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{amenity.name}</div>
                  {amenity.description && amenity.description !== amenity.name && (
                    <div className="text-sm text-gray-600 mt-1">{amenity.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
