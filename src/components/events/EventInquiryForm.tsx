"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HumanCheck } from "@/components/forms/HumanCheck";
import { todayAtProperty } from "@/lib/booking/dates";
import { eventTypes, weddingPackages } from "@/lib/events/content";
export function EventInquiryForm({
  mode = "public",
  wedding = true,
}: {
  mode?: "public" | "admin" | "preview";
  wedding?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(0);
  const submission = useRef("");
  const success = useRef<HTMLDivElement>(null);
  const sending = useRef(false);
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === "preview" || sending.current) return;
    sending.current = true;
    setState("sending");
    setError("");
    const data = new FormData(e.currentTarget);
    const optional = (key: string) =>
      String(data.get(key) || "").trim() || undefined;
    if (!submission.current) submission.current = crypto.randomUUID();
    try {
      const res = await fetch(
        mode === "admin"
          ? "/api/admin/events/inquiries"
          : "/api/events/inquiries",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: submission.current,
            name: data.get("name"),
            email: data.get("email"),
            phone: optional("phone"),
            eventType: data.get("eventType"),
            eventDate: optional("eventDate"),
            dateFlexibility: optional("dateFlexibility"),
            guests: Number(data.get("guests")),
            overnightGuests:
              optional("overnightGuests") !== undefined
                ? Number(data.get("overnightGuests"))
                : undefined,
            packageId: optional("packageId"),
            budget: optional("budget"),
            referralSource: optional("referralSource"),
            message: data.get("message") || "",
            website: data.get("website") || "",
            turnstileToken: token,
          }),
        },
      );
      const result = await res.json();
      if (!res.ok || !result.ok)
        throw new Error(result.error || "Please try again.");
      if (mode === "admin") {
        router.push(`/admin/events/${result.id}`);
        router.refresh();
        return;
      }
      setState("sent");
      setTimeout(() => success.current?.focus(), 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
      setState("idle");
      setToken("");
      setAttempt((a) => a + 1);
    } finally {
      sending.current = false;
    }
  }
  if (state === "sent")
    return (
      <div
        ref={success}
        tabIndex={-1}
        role="status"
        className="border-t border-brand-forest pt-6"
      >
        <h3 className="text-3xl mb-3">Your inquiry is with us.</h3>
        <p>
          We’ll reply by email with availability and next steps. Your dates are
          not reserved yet.
        </p>
        <a href="tel:+13148434321" className="text-link inline-block mt-5">
          (314) 843-4321
        </a>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5" aria-label="Event inquiry">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="field-label">
          Your name
          <input
            className="field"
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={120}
            required
          />
        </label>
        <label className="field-label">
          Email
          <input
            className="field"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={200}
            required
          />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="field-label">
          What are you planning?
          <select
            className="field"
            name="eventType"
            defaultValue={wedding ? "wedding" : "reunion"}
          >
            {Object.entries(eventTypes).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Phone (optional)
          <input
            className="field"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
          />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="field-label">
          Event date (if known)
          <input
            className="field"
            name="eventDate"
            type="date"
            min={todayAtProperty()}
          />
        </label>
        <label className="field-label">
          Flexible dates
          <input
            className="field"
            name="dateFlexibility"
            placeholder="e.g. a weekend in September"
            maxLength={120}
          />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="field-label">
          Total event guests
          <input
            className="field"
            name="guests"
            type="number"
            min={1}
            max={100}
            required
          />
          <span className="text-sm font-normal">Up to 100</span>
        </label>
        <label className="field-label">
          Staying overnight (optional)
          <input
            className="field"
            name="overnightGuests"
            type="number"
            min={0}
            max={50}
          />
          <span className="text-sm font-normal">
            Up to 50, including camping
          </span>
        </label>
      </div>
      <label className="field-label">
        Wedding package (optional)
        <select className="field" name="packageId">
          <option value="">Help me choose / another event</option>
          {weddingPackages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · ${p.price.toLocaleString("en-US")}
            </option>
          ))}
        </select>
      </label>
      <details className="border-y border-brand-sand py-4">
        <summary className="text-sm">A few more details (optional)</summary>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <label className="field-label">
            Venue budget
            <input
              className="field"
              name="budget"
              maxLength={100}
              placeholder="e.g. $3,000–$6,000"
            />
          </label>
          <label className="field-label">
            How did you hear about us?
            <input className="field" name="referralSource" maxLength={100} />
          </label>
        </div>
      </details>
      <label className="field-label">
        Anything else you’d like us to know? (optional)
        <textarea className="field" name="message" rows={3} maxLength={4000} />
      </label>
      <div className="absolute -left-[10000px]" aria-hidden="true">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {mode === "public" && (
        <HumanCheck action="inquiry" onToken={setToken} attempt={attempt} />
      )}
      {error && (
        <p role="alert" className="text-red-800">
          {error}
        </p>
      )}
      <p className="text-sm text-brand-stone">
        {mode === "admin"
          ? "Saves an inquiry without sending guest email or reserving dates."
          : "No payment needed. Sending an inquiry does not hold your dates."}
      </p>
      <button
        className="btn btn-primary"
        disabled={
          mode === "preview" ||
          state === "sending" ||
          (mode === "public" &&
            !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
            !token)
        }
      >
        {mode === "preview"
          ? "Preview only"
          : state === "sending"
            ? "Saving…"
            : mode === "admin"
              ? "Save event"
              : "Ask about your date"}
      </button>
    </form>
  );
}
