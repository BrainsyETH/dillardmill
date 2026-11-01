"use client";
import { useRef, useState } from "react";
import { todayAtProperty } from "@/lib/booking/dates";
import { HumanCheck } from "./HumanCheck";

export function GuestMessageForm({
  kind = "contact",
  unitSlug = "",
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = "",
  units = [],
}: {
  kind?: "contact" | "inquiry";
  unitSlug?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: string;
  units?: { slug: string; name: string }[];
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(0);
  const submission = useRef("");
  const status = useRef<HTMLDivElement>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const data = new FormData(e.currentTarget);
    if (!submission.current) submission.current = crypto.randomUUID();
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.current,
          kind,
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") || undefined,
          unitSlug: data.get("unitSlug") || unitSlug || undefined,
          checkIn: data.get("checkIn") || undefined,
          checkOut: data.get("checkOut") || undefined,
          guests: data.get("guests") ? Number(data.get("guests")) : undefined,
          message: data.get("message"),
          website: data.get("website"),
          turnstileToken: token,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok)
        throw new Error(
          result.error || "Your message could not be saved. Please try again.",
        );
      setState("sent");
      setTimeout(() => status.current?.focus(), 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Your message could not be saved. Please call (314) 843-4321.",
      );
      setState("idle");
      setToken("");
      setAttempt((a) => a + 1);
    }
  }
  if (state === "sent")
    return (
      <div
        ref={status}
        tabIndex={-1}
        role="status"
        className="border-t border-brand-forest pt-6"
      >
        <h2 className="text-3xl mb-4">Your message is with us.</h2>
        <p>
          We’ll reply to the email address you provided.{" "}
          {kind === "inquiry" &&
            "This is an inquiry; your dates are not reserved yet."}
        </p>
        <p className="mt-4 text-sm">
          If you need to reach us sooner, call{" "}
          <a className="underline" href="tel:+13148434321">
            (314) 843-4321
          </a>
          .
        </p>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      className="space-y-5"
      aria-label={kind === "inquiry" ? "Stay inquiry" : "Contact your hosts"}
    >
      {kind === "inquiry" && (
        <>
          <label className="field-label">
            Which stay?
            <select name="unitSlug" defaultValue={unitSlug} className="field">
              <option value="">Help me choose</option>
              {units.length ? (
                units.map((u) => (
                  <option key={u.slug} value={u.slug}>
                    {u.name}
                  </option>
                ))
              ) : (
                <option value={unitSlug}>
                  {unitSlug === "book-the-farm"
                    ? "The whole Farm"
                    : "This stay"}
                </option>
              )}
            </select>
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="field-label">
              Check in <span className="font-normal">(optional)</span>
              <input
                type="date"
                name="checkIn"
                min={todayAtProperty()}
                defaultValue={initialCheckIn}
                className="field"
              />
            </label>
            <label className="field-label">
              Check out <span className="font-normal">(optional)</span>
              <input
                type="date"
                name="checkOut"
                min={todayAtProperty()}
                defaultValue={initialCheckOut}
                className="field"
              />
            </label>
          </div>
          <label className="field-label">
            Number of guests
            <input
              type="number"
              name="guests"
              min={1}
              max={100}
              required
              defaultValue={initialGuests}
              className="field"
            />
          </label>
        </>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="field-label">
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            className="field"
          />
        </label>
        <label className="field-label">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={200}
            className="field"
          />
        </label>
      </div>
      <label className="field-label">
        Phone <span className="font-normal">(optional)</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={40}
          className="field"
        />
      </label>
      <label className="field-label">
        {kind === "inquiry" ? "Tell us about your stay" : "Your message"}
        <textarea
          name="message"
          rows={5}
          required
          minLength={5}
          maxLength={4000}
          className="field"
        />
      </label>
      <div className="absolute -left-[10000px]" aria-hidden="true">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <HumanCheck action="inquiry" onToken={setToken} attempt={attempt} />
      {error && (
        <p role="alert" className="text-red-800">
          {error}
        </p>
      )}
      <p className="text-sm text-brand-stone">
        We use your details to respond to this message.{" "}
        {kind === "inquiry" &&
          "No card needed; sending this form does not reserve dates."}
      </p>
      <button
        className="btn btn-primary"
        type="submit"
        disabled={
          state === "sending" ||
          (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !token)
        }
      >
        {state === "sending"
          ? "Sending…"
          : kind === "inquiry"
            ? "Send your inquiry"
            : "Send message"}
      </button>
    </form>
  );
}
