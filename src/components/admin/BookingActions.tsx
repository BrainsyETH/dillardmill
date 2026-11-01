"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  status: string;
  refundableCents: number;
}

interface BlockForReview {
  key: string;
  stay: string;
  platform: string;
  start: string;
  end: string;
  summary: string | null;
}

type Mode = "idle" | "decline" | "cancel";

export function BookingActions({ id, status, refundableCents }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Approval stopped because a calendar link couldn't be refreshed.
  const [calendarDown, setCalendarDown] = useState(false);
  // Approval stopped because another platform shows blocks on these dates.
  const [blocks, setBlocks] = useState<BlockForReview[] | null>(null);
  const [blocksConfirmed, setBlocksConfirmed] = useState(false);
  const [checkedByHand, setCheckedByHand] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [note, setNote] = useState("");
  const [refund, setRefund] = useState((refundableCents / 100).toFixed(2));

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === "calendar_unavailable") setCalendarDown(true);
        if (data.code === "blocks_need_review") {
          setBlocks(data.blocks ?? []);
          setBlocksConfirmed(false);
        }
        throw new Error(data.error || "Action failed");
      }
      setMode("idle");
      setBlocks(null);
      setCalendarDown(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  function approve() {
    act({
      action: "approve",
      calendarsCheckedManually: calendarDown && checkedByHand,
      confirmedBlockKeys:
        blocks && blocksConfirmed ? blocks.map((b) => b.key) : undefined,
    });
  }

  const needsBlockConfirmation = Boolean(blocks?.length) && !blocksConfirmed;
  const needsHandCheck = calendarDown && !checkedByHand;

  if (status === "requested") {
    return (
      <div className="space-y-3">
        {error && (
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
        )}

        {blocks && blocks.length > 0 && (
          <div className="border border-brand-sand p-3 space-y-2 text-sm">
            <ul className="space-y-1">
              {blocks.map((b) => (
                <li key={b.key}>
                  <strong>{b.stay}</strong> — {b.platform}: {b.start} → {b.end}
                  {b.summary ? (
                    <span className="text-brand-stone"> ({b.summary})</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={blocksConfirmed}
                onChange={(e) => setBlocksConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span>
                Each block above is for this request (for example, I blocked
                these dates myself after the request arrived).
              </span>
            </label>
          </div>
        )}

        {calendarDown && (
          <label className="flex items-start gap-2 text-sm border border-brand-sand p-3">
            <input
              type="checkbox"
              checked={checkedByHand}
              onChange={(e) => setCheckedByHand(e.target.checked)}
              className="mt-1"
            />
            <span>
              I checked those calendars by hand and the dates are free.
            </span>
          </label>
        )}

        {mode === "idle" ? (
          <div className="flex flex-wrap gap-3">
            <button
              disabled={busy || needsBlockConfirmation || needsHandCheck}
              onClick={() => {
                if (confirm("Approve this request and charge the card?"))
                  approve();
              }}
              className="btn btn-primary"
            >
              {busy ? "Working…" : "Approve & charge"}
            </button>
            <button
              disabled={busy}
              onClick={() => setMode("decline")}
              className="btn btn-outline"
            >
              Decline
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional message to the guest"
              className="field"
              rows={2}
            />
            <div className="flex flex-wrap gap-3">
              <button
                disabled={busy}
                onClick={() =>
                  act({ action: "decline", note: note || undefined })
                }
                className="btn btn-primary"
              >
                {busy ? "Working…" : "Decline & release hold"}
              </button>
              <button
                disabled={busy}
                onClick={() => setMode("idle")}
                className="text-link text-sm"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="space-y-3">
        {mode === "idle" ? (
          <button onClick={() => setMode("cancel")} className="btn btn-outline">
            Cancel booking…
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="field-label">
                Refund (up to ${(refundableCents / 100).toFixed(2)})
              </span>
              <span className="flex items-center gap-2">
                <span className="text-brand-stone">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  max={refundableCents / 100}
                  value={refund}
                  onChange={(e) => setRefund(e.target.value)}
                  className="field max-w-[10rem]"
                />
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional message to the guest"
              className="field"
              rows={2}
            />
            <div className="flex flex-wrap gap-3">
              <button
                disabled={busy}
                onClick={() => {
                  const cents = Math.round(Number(refund) * 100);
                  if (
                    confirm(
                      `Cancel and refund $${(cents / 100).toFixed(2)}? This frees the dates.`,
                    )
                  ) {
                    act({
                      action: "cancel",
                      refundCents: cents,
                      note: note || undefined,
                    });
                  }
                }}
                className="btn btn-primary"
              >
                {busy ? "Working…" : "Cancel & refund"}
              </button>
              <button
                disabled={busy}
                onClick={() => setMode("idle")}
                className="text-link text-sm"
              >
                Back
              </button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
    );
  }
  return null;
}
