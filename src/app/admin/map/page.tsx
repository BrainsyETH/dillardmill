'use client';

import Link from 'next/link';
import { AdminMapEditorDynamic } from '@/components/map';

export default function AdminMapPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Header */}
      <div className="bg-[#3A2A1E] text-[#F4F1EB] py-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-[#CBB8A3] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Property Map Editor</h1>
              <p className="text-[#CBB8A3] text-xs">Drag markers to reposition. Add or remove units and landmarks.</p>
            </div>
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

      <AdminMapEditorDynamic />
    </div>
  );
}
