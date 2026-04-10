'use client';

import Link from 'next/link';
import { AdminMapEditorDynamic } from '@/components/map';

export default function AdminMapPage() {
  return (
    <div className="h-dvh flex flex-col bg-[#F4F1EB] overflow-hidden">
      {/* Header */}
      <div className="bg-[#3A2A1E] text-[#F4F1EB] py-3 px-3 sm:px-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/admin"
              className="text-[#CBB8A3] hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold truncate">Property Map Editor</h1>
              <p className="text-[#CBB8A3] text-[10px] sm:text-xs hidden sm:block">
                Drag markers to reposition. Add or remove units and landmarks.
              </p>
            </div>
          </div>
          <Link
            href="/map"
            className="text-xs sm:text-sm text-[#CBB8A3] hover:text-white transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <span className="hidden sm:inline">View Public Map</span>
            <span className="sm:hidden">View</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AdminMapEditorDynamic />
      </div>
    </div>
  );
}
