'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function SyncNowButton() {
  const router = useRouter();
  const [state, setState] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <button
        disabled={state === 'Syncing…'}
        onClick={async () => {
          setState('Syncing…');
          try {
            const { results } = await call('/api/admin/sync', 'POST');
            const failed = results.filter((r: { success: boolean }) => !r.success).length;
            setState(failed ? `${failed} feed(s) failed — see below` : `Synced ${results.length} feed(s)`);
            router.refresh();
          } catch (e) {
            setState(e instanceof Error ? e.message : 'Sync failed');
          }
        }}
        className="px-5 py-2 bg-[#3A2A1E] text-white rounded-lg font-semibold disabled:opacity-50"
      >
        Sync now
      </button>
      {state && <span className="text-sm text-[#6F8291]">{state}</span>}
    </div>
  );
}

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input readOnly value={value} className="flex-1 min-w-0 text-xs font-mono rounded border border-[#CBB8A3] p-2 bg-[#F4F1EB]" />
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="px-3 text-sm rounded border border-[#3A2A1E]"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export function BlockForm({ units }: { units: { id: string; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-3 sm:grid-cols-5 items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        try {
          await call('/api/admin/blocks', 'POST', {
            unitId: f.get('unitId'),
            start: f.get('start'),
            end: f.get('end'),
            note: f.get('note') || undefined,
          });
          (e.target as HTMLFormElement).reset();
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed');
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="text-sm">
        Stay
        <select name="unitId" required className="mt-1 w-full rounded border border-[#CBB8A3] p-2">
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        First blocked night
        <input type="date" name="start" required className="mt-1 w-full rounded border border-[#CBB8A3] p-2" />
      </label>
      <label className="text-sm">
        Available again
        <input type="date" name="end" required className="mt-1 w-full rounded border border-[#CBB8A3] p-2" />
      </label>
      <label className="text-sm">
        Note (private)
        <input name="note" maxLength={200} placeholder="e.g. family visit" className="mt-1 w-full rounded border border-[#CBB8A3] p-2" />
      </label>
      <button disabled={busy} className="px-4 py-2 bg-[#6B7A5A] text-white rounded-lg font-semibold disabled:opacity-50">
        Block dates
      </button>
      {error && <p className="sm:col-span-5 text-sm text-red-700">{error}</p>}
    </form>
  );
}

export function DeleteBlockButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        if (!confirm('Remove this block and reopen the dates?')) return;
        await call('/api/admin/blocks', 'DELETE', { id });
        router.refresh();
      }}
      className="text-sm text-[#9C5A3C] underline"
    >
      Remove
    </button>
  );
}
