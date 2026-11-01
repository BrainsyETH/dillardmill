"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function SyncNowButton() {
  const router = useRouter();
  const [state, setState] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <button
        disabled={state === "Importing…"}
        onClick={async () => {
          setState("Importing…");
          try {
            const { results } = await call("/api/admin/sync", "POST");
            const failed = results.filter(
              (r: { success: boolean }) => !r.success,
            ).length;
            setState(
              failed
                ? `${failed} calendar(s) failed — see below`
                : `Imported ${results.length} calendar(s)`,
            );
            router.refresh();
          } catch (e) {
            setState(e instanceof Error ? e.message : "Sync failed");
          }
        }}
        className="btn btn-outline"
      >
        Import now
      </button>
      {state && <span className="text-sm text-brand-stone">{state}</span>}
    </div>
  );
}

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={value}
        className="field flex-1 min-w-0 text-xs font-mono"
      />
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="btn btn-outline"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function BlockForm({
  units,
}: {
  units: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-4 sm:grid-cols-5 items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        try {
          await call("/api/admin/blocks", "POST", {
            unitId: f.get("unitId"),
            start: f.get("start"),
            end: f.get("end"),
            note: f.get("note") || undefined,
          });
          (e.target as HTMLFormElement).reset();
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="block">
        <span className="field-label">Stay</span>
        <select name="unitId" required className="field">
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="field-label">First blocked night</span>
        <input type="date" name="start" required className="field" />
      </label>
      <label className="block">
        <span className="field-label">Available again</span>
        <input type="date" name="end" required className="field" />
      </label>
      <label className="block">
        <span className="field-label">Note (private)</span>
        <input
          name="note"
          maxLength={200}
          placeholder="e.g. Airbnb guest"
          className="field"
        />
      </label>
      <button disabled={busy} className="btn btn-primary">
        Block dates
      </button>
      {error && (
        <p role="alert" className="sm:col-span-5 text-sm text-red-800">
          {error}
        </p>
      )}
    </form>
  );
}

export function DeleteBlockButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        if (!confirm("Remove this block and reopen the dates?")) return;
        await call("/api/admin/blocks", "DELETE", { id });
        router.refresh();
      }}
      className="text-link text-sm"
    >
      Remove
    </button>
  );
}
