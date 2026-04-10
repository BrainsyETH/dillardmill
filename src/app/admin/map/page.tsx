'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PropertyMapDynamic } from '@/components/map';
import { mapUnits } from '@/lib/map/map-units';
import type { MapUnit } from '@/lib/map/map-units';

export default function AdminMapPage() {
  const [selectedUnit, setSelectedUnit] = useState<MapUnit | null>(null);

  const rentalUnits = mapUnits.filter((u) => u.type === 'unit');
  const landmarks = mapUnits.filter((u) => u.type === 'landmark');

  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Header */}
      <div className="bg-[#3A2A1E] text-[#F4F1EB] py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-[#CBB8A3] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">Property Map</h1>
            </div>
            <p className="text-[#CBB8A3] mt-1 ml-8">Manage unit and landmark positions</p>
          </div>
          <Link
            href="/map"
            className="text-sm text-[#CBB8A3] hover:text-white transition-colors flex items-center gap-1"
          >
            View Public Map
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Unit coordinates */}
        <aside className="lg:w-96 bg-white border-r border-gray-200 lg:h-[calc(100vh-100px)] overflow-y-auto">
          <div className="p-4">
            {/* Rental Units */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Rental Units ({rentalUnits.length})
            </h2>
            <div className="space-y-1">
              {rentalUnits.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUnit?.id === unit.id
                      ? 'bg-[#B87333]/10 border border-[#B87333]/30'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{unit.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {unit.capacity && (
                          <span className="text-xs text-gray-500">Sleeps {unit.capacity}</span>
                        )}
                        {unit.plumbing && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            unit.plumbing === 'full'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {unit.plumbing === 'full' ? 'Full plumbing' : 'Shared barn'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#B87333] flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    {unit.coordinates.lat.toFixed(4)}, {unit.coordinates.lng.toFixed(4)}
                  </p>
                </button>
              ))}
            </div>

            {/* Landmarks */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6">
              Landmarks ({landmarks.length})
            </h2>
            <div className="space-y-1">
              {landmarks.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUnit?.id === unit.id
                      ? 'bg-[#2D5A47]/10 border border-[#2D5A47]/30'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 text-sm">{unit.name}</h3>
                    <div className="w-3 h-3 rounded-full bg-[#2D5A47] flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{unit.description}</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    {unit.coordinates.lat.toFixed(4)}, {unit.coordinates.lng.toFixed(4)}
                  </p>
                </button>
              ))}
            </div>

            {/* Help */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Editing Positions</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                To update marker positions, edit the coordinates in{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded text-[11px]">
                  src/lib/map/map-units.ts
                </code>
                . Tip: right-click the map to copy coordinates from a specific spot.
              </p>
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
