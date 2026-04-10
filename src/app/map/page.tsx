'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PropertyMapDynamic, PropertyLayoutViewDynamic } from '@/components/map';

type TabId = 'layout' | 'location';

export default function MapPage() {
  const [activeTab, setActiveTab] = useState<TabId>('layout');

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
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-brand-sand px-4 flex gap-1">
        <TabButton
          label="Property Layout"
          sublabel="Our property from above"
          isActive={activeTab === 'layout'}
          onClick={() => setActiveTab('layout')}
        />
        <TabButton
          label="Location"
          sublabel="Where to find us"
          isActive={activeTab === 'location'}
          onClick={() => setActiveTab('location')}
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
      className={`px-5 py-3 text-left border-b-2 transition-colors ${
        isActive
          ? 'border-brand-copper text-brand-charcoal'
          : 'border-transparent text-brand-stone hover:text-brand-charcoal'
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-[10px] text-brand-stone uppercase tracking-wider">{sublabel}</div>
    </button>
  );
}
