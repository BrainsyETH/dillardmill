'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapUnits as defaultUnits, PROPERTY_CENTER, DEFAULT_ZOOM, DRONE_PHOTO_URL } from '@/lib/map/map-units';
import type { MapUnit, UnitType } from '@/lib/map/map-units';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type TabId = 'layout' | 'location';
type AddingMode = 'unit' | 'landmark' | null;
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function AdminMapEditor() {
  const [activeTab, setActiveTab] = useState<TabId>('layout');
  const [markers, setMarkers] = useState<MapUnit[]>(defaultUnits);
  const [savedSnapshot, setSavedSnapshot] = useState<MapUnit[]>(defaultUnits);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingMode, setAddingMode] = useState<AddingMode>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selected = markers.find((m) => m.id === selectedId) ?? null;
  const rentalUnits = markers.filter((m) => m.type === 'unit');
  const landmarks = markers.filter((m) => m.type === 'landmark');
  const isDirty = JSON.stringify(markers) !== JSON.stringify(savedSnapshot);

  // Load markers from API on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/map-markers')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.markers) && data.markers.length > 0) {
          const normalized = data.markers.map((m: MapUnit) => ({
            ...m,
            layoutPosition: m.layoutPosition ?? { x: 50, y: 50 },
          }));
          setMarkers(normalized);
          setSavedSnapshot(normalized);
        }
      })
      .catch((err) => console.error('Failed to load markers:', err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const updateMarker = useCallback((id: string, updates: Partial<MapUnit>) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const addMarker = useCallback((
    type: 'unit' | 'landmark',
    coordinates: { lng: number; lat: number },
    layoutPosition: { x: number; y: number },
  ) => {
    const newId = `${type}-${Date.now()}`;
    const newMarker: MapUnit = {
      id: newId,
      name: type === 'unit' ? 'New Unit' : 'New Landmark',
      type,
      description: '',
      coordinates,
      layoutPosition,
      showOnLayout: true,
      showOnLocation: true,
      ...(type === 'unit' ? {
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
  }, []);

  const handleDelete = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleReset = useCallback(() => {
    setMarkers(savedSnapshot);
    setSelectedId(null);
  }, [savedSnapshot]);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/map-markers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markers }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedSnapshot(markers);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [markers]);

  return (
    <div className="flex flex-col lg:flex-row h-full relative">
      {/* Mobile toggle for sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden absolute top-2 left-2 z-30 bg-white shadow-md rounded-md p-2"
        aria-label="Toggle marker list"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        fixed lg:relative top-0 lg:top-auto left-0 z-20
        w-full max-w-sm lg:w-96 h-full
        bg-white border-r border-gray-200 flex flex-col overflow-hidden
        transition-transform duration-300
      `}>
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={handleSave}
            disabled={!isDirty || saveStatus === 'saving'}
            className="text-xs px-3 py-1.5 rounded-md bg-[#B87333] text-white hover:bg-[#B87333]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {saveStatus === 'saving' && (
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : saveStatus === 'error' ? 'Error' : 'Save'}
          </button>
          <button
            onClick={handleReset}
            disabled={!isDirty}
            className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Discard Changes
          </button>
          {isLoading ? (
            <span className="ml-auto text-xs text-gray-400">Loading...</span>
          ) : isDirty ? (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Unsaved
            </span>
          ) : (
            <span className="ml-auto text-xs text-green-600">All changes saved</span>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                {addingMode === 'unit' ? 'Click to place...' : '+ Add Unit'}
              </button>
            </div>

            <div className="space-y-1 mb-6">
              {rentalUnits.map((unit) => (
                <MarkerListItem
                  key={unit.id}
                  unit={unit}
                  isSelected={selectedId === unit.id}
                  activeTab={activeTab}
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
                {addingMode === 'landmark' ? 'Click to place...' : '+ Add Landmark'}
              </button>
            </div>

            <div className="space-y-1 mb-6">
              {landmarks.map((unit) => (
                <MarkerListItem
                  key={unit.id}
                  unit={unit}
                  isSelected={selectedId === unit.id}
                  activeTab={activeTab}
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

      {/* Main area */}
      <div className="flex-1 relative flex flex-col">
        {/* Tabs */}
        <div className="flex bg-white border-b border-gray-200 px-4 flex-shrink-0">
          <TabButton
            label="Property Layout"
            sublabel="Drone photo"
            isActive={activeTab === 'layout'}
            onClick={() => setActiveTab('layout')}
          />
          <TabButton
            label="Location"
            sublabel="Satellite map"
            isActive={activeTab === 'location'}
            onClick={() => setActiveTab('location')}
          />
        </div>

        {/* Adding mode banner */}
        {addingMode && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${addingMode === 'unit' ? 'bg-[#B87333]' : 'bg-[#2D5A47]'}`} />
            Click on the {activeTab === 'layout' ? 'drone photo' : 'map'} to place a new {addingMode === 'unit' ? 'rental unit' : 'landmark'}
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

        {/* Active tab content */}
        <div className="flex-1 relative">
          {activeTab === 'layout' ? (
            <LayoutTab
              markers={markers}
              selectedId={selectedId}
              addingMode={addingMode}
              onSelect={(id) => { setSelectedId(id); setAddingMode(null); }}
              onDragEnd={(id, x, y) => updateMarker(id, { layoutPosition: { x, y } })}
              onAdd={(x, y) => {
                if (!addingMode) return;
                addMarker(addingMode, { lng: PROPERTY_CENTER.lng, lat: PROPERTY_CENTER.lat }, { x, y });
              }}
              onBackgroundClick={() => setSelectedId(null)}
            />
          ) : (
            <LocationTab
              markers={markers}
              selectedId={selectedId}
              addingMode={addingMode}
              onSelect={(id) => { setSelectedId(id); setAddingMode(null); }}
              onDragEnd={(id, lng, lat) => updateMarker(id, { coordinates: { lng, lat } })}
              onAdd={(lng, lat) => {
                if (!addingMode) return;
                addMarker(addingMode, { lng, lat }, { x: 50, y: 50 });
              }}
              onBackgroundClick={() => setSelectedId(null)}
            />
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 text-xs z-10">
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
    </div>
  );
}

// ===== Tabs =====

function TabButton({ label, sublabel, isActive, onClick }: {
  label: string; sublabel: string; isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-left border-b-2 transition-colors ${
        isActive
          ? 'border-[#B87333] text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{sublabel}</div>
    </button>
  );
}

// ===== Layout Tab (drone photo view) =====

function LayoutTab({
  markers,
  selectedId,
  addingMode,
  onSelect,
  onDragEnd,
  onAdd,
  onBackgroundClick,
}: {
  markers: MapUnit[];
  selectedId: string | null;
  addingMode: AddingMode;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onAdd: (x: number, y: number) => void;
  onBackgroundClick: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const getRelativePosition = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    const pos = getRelativePosition(e.clientX, e.clientY);
    if (pos) onDragEnd(draggingId, pos.x, pos.y);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (draggingId) return;
    if (addingMode) {
      const pos = getRelativePosition(e.clientX, e.clientY);
      if (pos) onAdd(pos.x, pos.y);
    } else {
      onBackgroundClick();
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-gradient-to-br from-brand-forest/40 to-brand-forest/70 overflow-hidden select-none"
      style={{ cursor: addingMode ? 'crosshair' : 'default' }}
      onClick={handleContainerClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Drone photo */}
      <img
        src={DRONE_PHOTO_URL}
        alt="Property aerial view"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Markers */}
      {markers.map((unit) => (
        <LayoutDraggableMarker
          key={unit.id}
          unit={unit}
          isSelected={selectedId === unit.id}
          isDragging={draggingId === unit.id}
          isHidden={unit.showOnLayout === false}
          onPointerDown={(e) => handlePointerDown(e, unit.id)}
          onClick={(e) => { e.stopPropagation(); onSelect(unit.id); }}
        />
      ))}
    </div>
  );
}

function LayoutDraggableMarker({
  unit,
  isSelected,
  isDragging,
  isHidden,
  onPointerDown,
  onClick,
}: {
  unit: MapUnit;
  isSelected: boolean;
  isDragging: boolean;
  isHidden: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}) {
  const isLandmark = unit.type === 'landmark';
  const bg = isLandmark ? '#2D5A47' : '#B87333';
  const ringBg = isLandmark ? 'rgba(45,90,71,0.3)' : 'rgba(184,115,51,0.3)';

  return (
    <div
      className="absolute flex flex-col items-center touch-none"
      style={{
        left: `${unit.layoutPosition.x}%`,
        top: `${unit.layoutPosition.y}%`,
        transform: 'translate(-50%, -100%)',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isHidden ? 0.35 : 1,
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <div
        style={{
          backgroundColor: bg,
          boxShadow: isSelected ? `0 0 0 4px ${ringBg}` : '0 2px 8px rgba(0,0,0,0.3)',
          transform: isSelected || isDragging ? 'scale(1.15)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.15s, box-shadow 0.15s',
        }}
        className="rounded-full p-2 pointer-events-none"
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
        className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-transparent -mt-[1px] pointer-events-none"
      />
      <span className="mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-gray-800 shadow-sm whitespace-nowrap max-w-[100px] truncate pointer-events-none">
        {unit.name}
      </span>
    </div>
  );
}

// ===== Location Tab (Mapbox satellite) =====

function LocationTab({
  markers,
  selectedId,
  addingMode,
  onSelect,
  onDragEnd,
  onAdd,
  onBackgroundClick,
}: {
  markers: MapUnit[];
  selectedId: string | null;
  addingMode: AddingMode;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, lng: number, lat: number) => void;
  onAdd: (lng: number, lat: number) => void;
  onBackgroundClick: () => void;
}) {
  if (!MAPBOX_TOKEN) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
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
    <div className="absolute inset-0">
      <Map
        initialViewState={{
          longitude: PROPERTY_CENTER.lng,
          latitude: PROPERTY_CENTER.lat,
          zoom: DEFAULT_ZOOM,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={(e) => {
          if (addingMode) {
            onAdd(e.lngLat.lng, e.lngLat.lat);
          } else {
            onBackgroundClick();
          }
        }}
        cursor={addingMode ? 'crosshair' : 'grab'}
      >
        <NavigationControl position="top-right" />

        {markers.map((unit) => (
          <LocationDraggableMarker
            key={unit.id}
            unit={unit}
            isSelected={selectedId === unit.id}
            isHidden={unit.showOnLocation === false}
            onSelect={() => onSelect(unit.id)}
            onDragEnd={(lng, lat) => onDragEnd(unit.id, lng, lat)}
          />
        ))}
      </Map>
    </div>
  );
}

function LocationDraggableMarker({
  unit,
  isSelected,
  isHidden,
  onSelect,
  onDragEnd,
}: {
  unit: MapUnit;
  isSelected: boolean;
  isHidden: boolean;
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
      <div className="flex flex-col items-center cursor-grab active:cursor-grabbing" style={{ opacity: isHidden ? 0.35 : 1 }}>
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

// ===== Sidebar sub-components =====

function MarkerListItem({
  unit,
  isSelected,
  activeTab,
  onSelect,
  onDelete,
}: {
  unit: MapUnit;
  isSelected: boolean;
  activeTab: TabId;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const isLandmark = unit.type === 'landmark';

  const coordDisplay = activeTab === 'layout'
    ? `${unit.layoutPosition.x.toFixed(1)}%, ${unit.layoutPosition.y.toFixed(1)}%`
    : `${unit.coordinates.lat.toFixed(5)}, ${unit.coordinates.lng.toFixed(5)}`;

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
        <div className="text-[10px] text-gray-400 font-mono">{coordDisplay}</div>
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

      <Field label="Image URL">
        <input
          type="text"
          value={marker.image || ''}
          onChange={(e) => onChange({ image: e.target.value || undefined })}
          placeholder="/images/cozy-cottage.jpg or https://..."
          className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333] outline-none"
        />
        {marker.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={marker.image}
            alt={marker.name}
            className="mt-2 w-full h-24 object-cover rounded-md border border-gray-200"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </Field>

      <Field label="Visibility">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={marker.showOnLayout !== false}
              onChange={(e) => onChange({ showOnLayout: e.target.checked })}
              className="rounded border-gray-300 text-[#B87333] focus:ring-[#B87333]"
            />
            Show on Property Layout
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={marker.showOnLocation !== false}
              onChange={(e) => onChange({ showOnLocation: e.target.checked })}
              className="rounded border-gray-300 text-[#B87333] focus:ring-[#B87333]"
            />
            Show on Location Map
          </label>
        </div>
      </Field>

      <Field label="Layout Position">
        <div className="text-xs font-mono text-gray-500 bg-gray-100 rounded-md px-2.5 py-1.5">
          {marker.layoutPosition.x.toFixed(2)}%, {marker.layoutPosition.y.toFixed(2)}%
          <span className="text-gray-400 ml-2">(drag on Layout tab)</span>
        </div>
      </Field>

      <Field label="Geographic Coordinates">
        <div className="text-xs font-mono text-gray-500 bg-gray-100 rounded-md px-2.5 py-1.5">
          {marker.coordinates.lat.toFixed(6)}, {marker.coordinates.lng.toFixed(6)}
          <span className="text-gray-400 ml-2">(drag on Location tab)</span>
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
