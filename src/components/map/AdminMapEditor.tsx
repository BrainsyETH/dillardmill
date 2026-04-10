'use client';

import { useState, useCallback, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapUnits as defaultUnits, PROPERTY_CENTER, DEFAULT_ZOOM } from '@/lib/map/map-units';
import type { MapUnit, MarkerType, UnitType } from '@/lib/map/map-units';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const STORAGE_KEY = 'pine-valley-map-markers';

function loadMarkers(): MapUnit[] {
  if (typeof window === 'undefined') return defaultUnits;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultUnits;
}

function saveMarkers(markers: MapUnit[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
  } catch {}
}

type AddingMode = 'unit' | 'landmark' | null;

export default function AdminMapEditor() {
  const [markers, setMarkers] = useState<MapUnit[]>(() => loadMarkers());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingMode, setAddingMode] = useState<AddingMode>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  const selected = markers.find((m) => m.id === selectedId) ?? null;
  const rentalUnits = markers.filter((m) => m.type === 'unit');
  const landmarks = markers.filter((m) => m.type === 'landmark');

  // Auto-save to localStorage on changes
  useEffect(() => {
    saveMarkers(markers);
    setHasChanges(JSON.stringify(markers) !== JSON.stringify(defaultUnits));
  }, [markers]);

  const updateMarker = useCallback((id: string, updates: Partial<MapUnit>) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const handleDragEnd = useCallback((id: string, lng: number, lat: number) => {
    updateMarker(id, { coordinates: { lng, lat } });
  }, [updateMarker]);

  const handleMapClick = useCallback((e: { lngLat: { lng: number; lat: number } }) => {
    if (!addingMode) {
      setSelectedId(null);
      return;
    }

    const newId = `${addingMode}-${Date.now()}`;
    const newMarker: MapUnit = {
      id: newId,
      name: addingMode === 'unit' ? 'New Unit' : 'New Landmark',
      type: addingMode,
      description: '',
      coordinates: { lng: e.lngLat.lng, lat: e.lngLat.lat },
      ...(addingMode === 'unit' ? {
        unitType: 'cabin' as UnitType,
        capacity: 2,
        beds: '',
        amenities: [],
        plumbing: 'full' as const,
      } : {}),
    };

    setMarkers((prev) => [...prev, newMarker]);
    setSelectedId(newId);
    setAddingMode(null);
  }, [addingMode]);

  const handleDelete = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleReset = useCallback(() => {
    setMarkers(defaultUnits);
    setSelectedId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleExport = useCallback(async () => {
    const json = JSON.stringify(markers, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    } catch {}
  }, [markers]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-2 font-medium">Mapbox token not configured</p>
          <p className="text-gray-400 text-sm">
            Add <code className="bg-gray-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <aside className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleExport}
            className="text-xs px-3 py-1.5 rounded-md bg-[#2D5A47] text-white hover:bg-[#2D5A47]/90 transition-colors"
          >
            {copiedExport ? 'Copied!' : 'Export JSON'}
          </button>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reset Defaults
          </button>
          {hasChanges && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Unsaved
            </span>
          )}
        </div>

        {/* Marker list + edit form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Rental Units */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rental Units ({rentalUnits.length})
              </h2>
              <button
                onClick={() => setAddingMode(addingMode === 'unit' ? null : 'unit')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  addingMode === 'unit'
                    ? 'bg-[#B87333] text-white'
                    : 'text-[#B87333] hover:bg-[#B87333]/10'
                }`}
              >
                {addingMode === 'unit' ? 'Click map to place...' : '+ Add Unit'}
              </button>
            </div>

            <div className="space-y-1 mb-6">
              {rentalUnits.map((unit) => (
                <MarkerListItem
                  key={unit.id}
                  unit={unit}
                  isSelected={selectedId === unit.id}
                  onSelect={() => setSelectedId(unit.id)}
                  onDelete={() => handleDelete(unit.id)}
                />
              ))}
            </div>

            {/* Landmarks */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Landmarks ({landmarks.length})
              </h2>
              <button
                onClick={() => setAddingMode(addingMode === 'landmark' ? null : 'landmark')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  addingMode === 'landmark'
                    ? 'bg-[#2D5A47] text-white'
                    : 'text-[#2D5A47] hover:bg-[#2D5A47]/10'
                }`}
              >
                {addingMode === 'landmark' ? 'Click map to place...' : '+ Add Landmark'}
              </button>
            </div>

            <div className="space-y-1 mb-6">
              {landmarks.map((unit) => (
                <MarkerListItem
                  key={unit.id}
                  unit={unit}
                  isSelected={selectedId === unit.id}
                  onSelect={() => setSelectedId(unit.id)}
                  onDelete={() => handleDelete(unit.id)}
                />
              ))}
            </div>
          </div>

          {/* Edit form */}
          {selected && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Edit Marker</h3>
              <MarkerEditForm
                marker={selected}
                onChange={(updates) => updateMarker(selected.id, updates)}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative">
        {addingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${addingMode === 'unit' ? 'bg-[#B87333]' : 'bg-[#2D5A47]'}`} />
            Click on the map to place a new {addingMode === 'unit' ? 'rental unit' : 'landmark'}
            <button
              onClick={() => setAddingMode(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <Map
          initialViewState={{
            longitude: PROPERTY_CENTER.lng,
            latitude: PROPERTY_CENTER.lat,
            zoom: DEFAULT_ZOOM,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={handleMapClick}
          cursor={addingMode ? 'crosshair' : 'grab'}
        >
          <NavigationControl position="top-right" />

          {markers.map((unit) => (
            <DraggableMarker
              key={unit.id}
              unit={unit}
              isSelected={selectedId === unit.id}
              onSelect={() => {
                setSelectedId(unit.id);
                setAddingMode(null);
              }}
              onDragEnd={(lng, lat) => handleDragEnd(unit.id, lng, lat)}
            />
          ))}
        </Map>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#B87333]" />
              <span className="text-gray-700">Rental Units</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#2D5A47]" />
              <span className="text-gray-700">Landmarks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function MarkerListItem({
  unit,
  isSelected,
  onSelect,
  onDelete,
}: {
  unit: MapUnit;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const isLandmark = unit.type === 'landmark';
  return (
    <div
      className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? isLandmark ? 'bg-[#2D5A47]/10 ring-1 ring-[#2D5A47]/30' : 'bg-[#B87333]/10 ring-1 ring-[#B87333]/30'
          : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLandmark ? 'bg-[#2D5A47]' : 'bg-[#B87333]'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{unit.name}</div>
        <div className="text-[10px] text-gray-400 font-mono">
          {unit.coordinates.lat.toFixed(5)}, {unit.coordinates.lng.toFixed(5)}
        </div>
      </div>
      {unit.capacity && (
        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">
          {unit.capacity}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all flex-shrink-0"
        title="Delete marker"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

function MarkerEditForm({
  marker,
  onChange,
}: {
  marker: MapUnit;
  onChange: (updates: Partial<MapUnit>) => void;
}) {
  const isUnit = marker.type === 'unit';

  return (
    <div className="space-y-3">
      <Field label="Name">
        <input
          type="text"
          value={marker.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={marker.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none resize-none"
        />
      </Field>

      {isUnit && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit Type">
              <select
                value={marker.unitType || 'cabin'}
                onChange={(e) => onChange({ unitType: e.target.value as UnitType })}
                className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
              >
                <option value="cabin">Cabin</option>
                <option value="airstream">Airstream</option>
                <option value="cafe">Cafe</option>
                <option value="tiny-cabin">Tiny Cabin</option>
              </select>
            </Field>

            <Field label="Capacity">
              <input
                type="number"
                min={1}
                value={marker.capacity || ''}
                onChange={(e) => onChange({ capacity: parseInt(e.target.value) || undefined })}
                className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
              />
            </Field>
          </div>

          <Field label="Beds">
            <input
              type="text"
              value={marker.beds || ''}
              onChange={(e) => onChange({ beds: e.target.value || undefined })}
              placeholder="e.g. 1 Queen + 2 Twins"
              className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
            />
          </Field>

          <Field label="Plumbing">
            <select
              value={marker.plumbing || 'full'}
              onChange={(e) => onChange({ plumbing: e.target.value as 'full' | 'shared-barn' })}
              className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
            >
              <option value="full">Full Plumbing</option>
              <option value="shared-barn">Shared Barn Bathhouse</option>
            </select>
          </Field>

          <Field label="Amenities (comma-separated)">
            <input
              type="text"
              value={(marker.amenities || []).join(', ')}
              onChange={(e) => onChange({ amenities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder="A/C, Kitchen, Deck"
              className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Detail URL">
              <input
                type="text"
                value={marker.detailUrl || ''}
                onChange={(e) => onChange({ detailUrl: e.target.value || undefined })}
                placeholder="/cozycottage"
                className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
              />
            </Field>

            <Field label="Booking URL">
              <input
                type="text"
                value={marker.bookingUrl || ''}
                onChange={(e) => onChange({ bookingUrl: e.target.value || undefined })}
                placeholder="https://airbnb.com/..."
                className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
              />
            </Field>
          </div>
        </>
      )}

      <Field label="Coordinates">
        <div className="text-xs font-mono text-gray-500 bg-gray-100 rounded-md px-2.5 py-1.5">
          {marker.coordinates.lat.toFixed(6)}, {marker.coordinates.lng.toFixed(6)}
          <span className="text-gray-400 ml-2">(drag marker to change)</span>
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function DraggableMarker({
  unit,
  isSelected,
  onSelect,
  onDragEnd,
}: {
  unit: MapUnit;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (lng: number, lat: number) => void;
}) {
  const isLandmark = unit.type === 'landmark';
  const bg = isLandmark ? '#2D5A47' : '#B87333';
  const ringBg = isLandmark ? 'rgba(45,90,71,0.3)' : 'rgba(184,115,51,0.3)';

  return (
    <Marker
      longitude={unit.coordinates.lng}
      latitude={unit.coordinates.lat}
      anchor="bottom"
      draggable
      onDragEnd={(e) => onDragEnd(e.lngLat.lng, e.lngLat.lat)}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onSelect();
      }}
    >
      <div className="flex flex-col items-center cursor-grab active:cursor-grabbing">
        <div
          style={{
            backgroundColor: bg,
            boxShadow: isSelected ? `0 0 0 4px ${ringBg}` : '0 2px 8px rgba(0,0,0,0.3)',
            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          className="rounded-full p-2"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isLandmark ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            )}
          </svg>
        </div>
        <div
          style={{ borderTopColor: bg }}
          className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-transparent -mt-[1px]"
        />
        <span className="mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-gray-800 shadow-sm whitespace-nowrap max-w-[100px] truncate">
          {unit.name}
        </span>
      </div>
    </Marker>
  );
}
