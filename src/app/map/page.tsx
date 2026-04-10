'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PropertyMapDynamic } from '@/components/map';
import { mapUnits } from '@/lib/map/map-units';

export default function MapPage() {
  const [showSidebar, setShowSidebar] = useState(false);

  const rentalUnits = mapUnits.filter((u) => u.type === 'unit');
  const landmarks = mapUnits.filter((u) => u.type === 'landmark');

  return (
    <div className="relative">
      {/* Header bar */}
      <div className="bg-white border-b border-brand-sand px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/the-area"
            className="text-brand-forest hover:text-brand-copper transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="font-serif text-xl font-semibold text-brand-forest">
            Property Map
          </h1>
        </div>

        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="md:hidden text-brand-forest hover:text-brand-copper transition-colors p-2"
          aria-label="Toggle unit list"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex relative">
        {/* Sidebar - unit list */}
        <aside className={`
          absolute md:relative z-10 bg-white border-r border-brand-sand
          w-72 h-[calc(100vh-80px)] overflow-y-auto
          transition-transform duration-300
          ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-brand-stone uppercase tracking-wider mb-3">
              Rental Units
            </h2>
            <div className="space-y-2">
              {rentalUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="p-3 rounded-lg hover:bg-brand-sand/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-brand-charcoal text-sm">{unit.name}</h3>
                      {unit.beds && (
                        <p className="text-xs text-brand-stone mt-0.5">{unit.beds}</p>
                      )}
                    </div>
                    {unit.capacity && (
                      <span className="text-xs bg-brand-copper/10 text-brand-copper px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {unit.capacity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-sm font-semibold text-brand-stone uppercase tracking-wider mb-3 mt-6">
              Landmarks
            </h2>
            <div className="space-y-2">
              {landmarks.map((unit) => (
                <div
                  key={unit.id}
                  className="p-3 rounded-lg hover:bg-brand-sage/10 transition-colors cursor-pointer"
                >
                  <h3 className="font-medium text-brand-charcoal text-sm">{unit.name}</h3>
                  <p className="text-xs text-brand-stone mt-0.5">{unit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1">
          <PropertyMapDynamic variant="fullscreen" />
        </div>
      </div>
    </div>
  );
}
