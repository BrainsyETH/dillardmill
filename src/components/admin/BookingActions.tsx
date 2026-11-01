'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
  status: string;
  refundableCents: number;
}

export function BookingActions({ id, status, refundableCents }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set when approval stopped because another platform's calendar couldn't be refreshed.
  const [calendarDown, setCalendarDown] = useState(false);
  const [mode, setMode] = useState<'idle' | 'decline' | 'cancel'>('idle');
  const [note, setNote] = useState('');
  const [refund, setRefund] = useState((refundableCents / 100).toFixed(2));

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setCalendarDown(false);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === 'calendar_unavailable') setCalendarDown(true);
        throw new Error(data.error || 'Action failed');
      }
      setMode('idle');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  const btn = 'px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50';

  if (status === 'requested') {
    return (
      <div className="space-y-2">
        {mode === 'idle' ? (
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={() => {
                if (confirm('Approve this request and charge the card?')) act({ action: 'approve' });
              }}
              className={`${btn} bg-[#6B7A5A] text-white hover:bg-[#59664a]`}
            >
              {busy ? 'Working…' : 'Approve & charge'}
            </button>
            <button disabled={busy} onClick={() => setMode('decline')} className={`${btn} border border-[#9C5A3C] text-[#9C5A3C]`}>
              Decline
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional message to the guest"
              className="w-full rounded border border-[#CBB8A3] p-2 text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => act({ action: 'decline', note: note || undefined })} className={`${btn} bg-[#9C5A3C] text-white`}>
                {busy ? 'Working…' : 'Decline & release hold'}
              </button>
              <button disabled={busy} onClick={() => setMode('idle')} className={`${btn} text-[#6F8291]`}>
                Back
              </button>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
        {calendarDown && (
          <button
            disabled={busy}
            onClick={() => {
              if (confirm('Have you checked those dates on the other platform yourself? The card will be charged.')) {
                act({ action: 'approve', calendarsCheckedManually: true });
              }
            }}
            className={`${btn} border border-[#6B7A5A] text-[#6B7A5A]`}
          >
            Approve anyway — I checked the calendars
          </button>
        )}
      </div>
    );
  }

  if (status === 'confirmed') {
    return (
      <div className="space-y-2">
        {mode === 'idle' ? (
          <button onClick={() => setMode('cancel')} className={`${btn} border border-[#9C5A3C] text-[#9C5A3C]`}>
            Cancel booking…
          </button>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm">
              Refund amount ($)
              <input
                type="number"
                min={0}
                step="0.01"
                max={refundableCents / 100}
                value={refund}
                onChange={(e) => setRefund(e.target.value)}
                className="ml-2 w-28 rounded border border-[#CBB8A3] p-1"
              />
              <span className="ml-2 text-[#6F8291]">of ${(refundableCents / 100).toFixed(2)}</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional message to the guest"
              className="w-full rounded border border-[#CBB8A3] p-2 text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                disabled={busy}
                onClick={() => {
                  const cents = Math.round(Number(refund) * 100);
                  if (confirm(`Cancel and refund $${(cents / 100).toFixed(2)}? This frees the dates.`)) {
                    act({ action: 'cancel', refundCents: cents, note: note || undefined });
                  }
                }}
                className={`${btn} bg-[#9C5A3C] text-white`}
              >
                {busy ? 'Working…' : 'Cancel & refund'}
              </button>
              <button disabled={busy} onClick={() => setMode('idle')} className={`${btn} text-[#6F8291]`}>
                Back
              </button>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    );
  }
  return null;
}
