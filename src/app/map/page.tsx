'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PropertyMapDynamic, PropertyLayoutViewDynamic } from '@/components/map';

type TabId = 'layout' | 'location';

export default function MapPage() {
  // Default to Location for first-time visitors — they want to know where
  // the property is before they care about the internal layout.
  const [activeTab, setActiveTab] = useState<TabId>('location');

  return (
    <div className="relative">
      {/* Header bar */}
      <div className="bg-white border-b border-brand-sand px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/the-area"
            className="text-brand-forest hover:text-brand-copper transition-colors flex items-center gap-1 text-sm font-medium flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="font-serif text-lg sm:text-xl font-semibold text-brand-forest truncate">
            Property Map
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-brand-sand px-2 sm:px-4 flex gap-1 overflow-x-auto">
        <TabButton
          label="Location"
          sublabel="Find & get directions"
          isActive={activeTab === 'location'}
          onClick={() => setActiveTab('location')}
        />
        <TabButton
          label="Property Layout"
          sublabel="Aerial view of the grounds"
          isActive={activeTab === 'layout'}
          onClick={() => setActiveTab('layout')}
        />
      </div>

      {/* Active tab */}
      <div>
        {activeTab === 'layout' ? (
          <PropertyLayoutViewDynamic variant="fullscreen" />
        ) : (
          <PropertyMapDynamic variant="fullscreen" />
        )}
      </div>
    </div>
  );
}

function TabButton({ label, sublabel, isActive, onClick }: {
  label: string; sublabel: string; isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 sm:px-5 py-2.5 sm:py-3 text-left border-b-2 transition-colors flex-shrink-0 ${
        isActive
          ? 'border-brand-copper text-brand-charcoal'
          : 'border-transparent text-brand-stone hover:text-brand-charcoal'
      }`}
    >
      <div className="text-xs sm:text-sm font-semibold whitespace-nowrap">{label}</div>
      <div className="text-[9px] sm:text-[10px] text-brand-stone uppercase tracking-wider whitespace-nowrap">{sublabel}</div>
    </button>
  );
}
