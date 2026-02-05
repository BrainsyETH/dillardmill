'use client';

import { motion } from 'framer-motion';

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
      <div className="text-brand-stone">No amenities listed</div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category, categoryIndex) => (
        <motion.div 
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
        >
          <h3 className="font-serif text-lg font-semibold mb-4 text-brand-forest flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-copper/10 flex items-center justify-center">
              <span className="text-brand-copper text-sm">
                {category === 'Kitchen' && '🍳'}
                {category === 'Bathroom' && '🚿'}
                {category === 'Bedroom' && '🛏️'}
                {category === 'Entertainment' && '📺'}
                {category === 'Outdoor' && '🌲'}
                {category === 'Parking' && '🚗'}
                {category === 'General' && '✨'}
                {!['Kitchen', 'Bathroom', 'Bedroom', 'Entertainment', 'Outdoor', 'Parking', 'General'].includes(category) && '•'}
              </span>
            </span>
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grouped[category].map((amenity, index) => (
              <div
                key={amenity._id || index}
                className="flex items-start gap-3 p-4 bg-brand-cream rounded-xl border border-brand-sand/50 hover:border-brand-sand transition-colors"
                title={amenity.description}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-brand-copper">
                  {amenity.icon ? (
                    <span>{amenity.icon}</span>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-brand-forest">{amenity.name}</div>
                  {amenity.description && amenity.description !== amenity.name && (
                    <div className="text-sm text-brand-stone mt-0.5 line-clamp-2">{amenity.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
