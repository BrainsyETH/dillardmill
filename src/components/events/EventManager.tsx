"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { todayAtProperty } from "@/lib/booking/dates";
import { eventStages } from "@/lib/events/content";
import type { EventLead, EventReservation } from "@/lib/events/service";
export function EventManager({
  lead,
  active,
  blocks,
}: {
  lead: EventLead;
  active?: EventReservation;
  blocks: {
    key: string;
    unit: string;
    source: string;
    start: string;
    end: string;
  }[];
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState("");
  const router = useRouter();
  async function save(body: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const response = await fetch(`/api/admin/events/${lead.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save.");
      setSaved(
        body.action === "release"
          ? "Dates released here. Remove matching blocks from your other listings."
          : "Saved.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  function onForm(e: React.FormEvent<HTMLFormElement>, action: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: Record<string, unknown> = Object.fromEntries(form.entries());
    for (const key of ["calendarsChecked", "agreementConfirmed"])
      data[key] = form.get(key) === "on";
    void save({
      ...data,
      action,
      reservationId: active?.id,
      externalBlockKeys: blocks.map((b) => b.key),
    });
  }
  return (
    <div className="space-y-10">
      {error && (
        <p role="alert" className="border-l-2 border-red-800 pl-4 text-red-800">
          {error}{" "}
          <button className="underline" onClick={() => router.refresh()}>
            Reload event
          </button>
        </p>
      )}
      {saved && (
        <p role="status" className="border-l-2 border-brand-forest pl-4">
          {saved}
        </p>
      )}
      <form onSubmit={(e) => onForm(e, "update")} className="space-y-5">
        <h2 className="text-3xl">Follow-up</h2>
        <fieldset disabled={busy} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="field-label">
              Progress
              <select
                className="field"
                name="stage"
                defaultValue={lead.event_stage}
              >
                {Object.entries(eventStages).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Handled by
              <input
                className="field"
                name="assignedTo"
                defaultValue={lead.assigned_to || ""}
                maxLength={120}
              />
            </label>
            <label className="field-label">
              Follow up on
              <input
                className="field"
                type="date"
                name="followUpOn"
                defaultValue={lead.follow_up_on || ""}
              />
            </label>
          </div>
          <label className="field-label">
            Private notes
            <textarea
              className="field"
              rows={4}
              name="notes"
              defaultValue={lead.admin_notes || ""}
              maxLength={8000}
            />
          </label>
          <button className="btn btn-primary">Save follow-up</button>
        </fieldset>
      </form>
      <section className="border-t border-brand-sand pt-8">
        <h2 className="text-3xl mb-4">Reserved dates</h2>
        <p className="text-sm mb-6">
          Event holds reserve the whole property. Include any setup and cleanup
          nights.{" "}
          <Link className="text-link" href="/admin/calendar">
            Review calendars ↗
          </Link>
        </p>
        {active ? (
          <div>
            <p className="text-lg font-medium">
              {active.start_date} → {active.end_date} ·{" "}
              {active.status === "confirmed" ? "Booked" : "Held"}
            </p>
            {active.expires_at && (
              <p className="text-sm mt-2">
                Ends{" "}
                {new Date(active.expires_at).toLocaleString("en-US", {
                  timeZone: "America/Chicago",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                Central
              </p>
            )}
            {active.status === "held" && (
              <>
                <form
                  onSubmit={(e) => onForm(e, "extend")}
                  className="flex flex-wrap gap-4 items-end mt-6"
                >
                  <label className="field-label">
                    Extend hold through (Central)
                    <input
                      className="field"
                      type="date"
                      name="expiresOn"
                      required
                      min={todayAtProperty()}
                    />
                  </label>
                  <button disabled={busy} className="btn btn-outline">
                    Update expiry
                  </button>
                </form>
                <form
                  onSubmit={(e) => onForm(e, "confirm")}
                  className="space-y-4 border-t border-brand-sand mt-7 pt-6"
                >
                  {blocks.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium mb-2">
                        Imported blocks overlapping this event:
                      </p>
                      <ul className="space-y-1">
                        {blocks.map((b) => (
                          <li key={b.key}>
                            {b.unit} · {b.source} · {b.start} → {b.end}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <label className="flex items-start gap-3">
                    <input
                      className="mt-1"
                      type="checkbox"
                      name="calendarsChecked"
                      required
                    />
                    <span>
                      I checked all external listings
                      {blocks.length
                        ? ", and every imported block listed above is for this event"
                        : ""}
                      .
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input
                      className="mt-1"
                      type="checkbox"
                      name="agreementConfirmed"
                      required
                    />
                    <span>
                      The contract and required payment have been arranged.
                    </span>
                  </label>
                  <button disabled={busy} className="btn btn-primary">
                    Confirm event dates
                  </button>
                  <p className="text-sm text-brand-stone">
                    Records the reservation here. Payments and contracts are
                    handled separately.
                  </p>
                </form>
              </>
            )}
            <details className="mt-7 border-t border-brand-sand pt-5">
              <summary className="text-sm">Release these dates</summary>
              <form
                onSubmit={(e) => onForm(e, "release")}
                className="mt-4 space-y-4"
              >
                <label className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1" />
                  <span>
                    Reopen these dates for lodging. Any external calendar blocks
                    and refunds need to be handled separately.
                  </span>
                </label>
                <button className="btn btn-outline" disabled={busy}>
                  Release dates
                </button>
              </form>
            </details>
          </div>
        ) : (
          <form onSubmit={(e) => onForm(e, "hold")} className="space-y-5">
            <fieldset disabled={busy} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="field-label">
                  Arrival / setup begins
                  <input
                    className="field"
                    type="date"
                    name="start"
                    min={todayAtProperty()}
                    required
                  />
                </label>
                <label className="field-label">
                  Departure / property available again
                  <input
                    className="field"
                    type="date"
                    name="end"
                    min={todayAtProperty()}
                    required
                  />
                </label>
                <label className="field-label">
                  Hold through (Central)
                  <input
                    className="field"
                    type="date"
                    name="expiresOn"
                    min={todayAtProperty()}
                    required
                  />
                </label>
              </div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="calendarsChecked"
                  required
                  className="mt-1"
                />
                <span>
                  I checked Airbnb and every other listing for these dates.
                </span>
              </label>
              <button className="btn btn-primary">Hold the whole Farm</button>
            </fieldset>
          </form>
        )}
        <p className="text-sm mt-6 border-l-2 border-brand-copper pl-4">
          Block the same dates on Airbnb and every other listing. When a hold
          expires or is released, remove those blocks there too.
        </p>
      </section>
    </div>
  );
}
