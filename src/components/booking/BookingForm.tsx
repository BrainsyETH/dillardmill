"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HumanCheck } from "@/components/forms/HumanCheck";
import { DatePicker } from "./DatePicker";
import { GuestSelector } from "./GuestSelector";
import { SquarePayment, type CardHandle } from "./SquarePayment";
import type { Quote } from "@/lib/booking/pricing";
import type { GuestPolicies } from "@/lib/booking/service";
import { isIsoDate } from "@/lib/booking/dates";

interface BookingFormProps {
  unit: {
    _id: string;
    name: string;
    slug: { current: string };
    basePrice: number;
    cleaningFee?: number;
    baseGuests?: number;
    extraGuestFee?: number;
    petsAllowed?: boolean;
    maxPets?: number;
    petFee?: number;
    minStay?: number;
    maxGuests: number;
    directBookingEnabled?: boolean;
  };
  /** Pre-fill dates (ISO yyyy-mm-dd), e.g. from /lodging search. */
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialPets?: number;
  responseHours?: number;
}

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

const pretty = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

type Step = "dates" | "details" | "payment";

export function BookingForm({
  unit,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialPets = 0,
  responseHours = 24,
}: BookingFormProps) {
  const router = useRouter();
  const slug = unit.slug.current;
  const minStay = Math.max(1, unit.minStay ?? 1);
  const maxPets = unit.petsAllowed ? (unit.maxPets ?? 2) : 0;

  const [step, setStep] = useState<Step>("dates");
  const [checkIn, setCheckIn] = useState<string | undefined>(
    isIsoDate(initialCheckIn) ? initialCheckIn : undefined,
  );
  const [checkOut, setCheckOut] = useState<string | undefined>(
    isIsoDate(initialCheckIn) && isIsoDate(initialCheckOut)
      ? initialCheckOut
      : undefined,
  );
  const [guests, setGuests] = useState(() =>
    Math.max(1, initialGuests ?? Math.min(2, unit.maxGuests || 1)),
  );
  const [pets, setPets] = useState(initialPets);
  const [humanToken, setHumanToken] = useState("");
  const [humanAttempt, setHumanAttempt] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      heading.current?.focus();
    }
  }, [step]);
  const [calendarKey, setCalendarKey] = useState(0);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [policies, setPolicies] = useState<GuestPolicies | null>(null);
  const [quoteState, setQuoteState] = useState<
    "idle" | "loading" | "ok" | "unavailable" | "error"
  >("idle");
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);

  const cardRef = useRef<CardHandle>(null);
  const [cardReady, setCardReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // One idempotency key per attempt so a double-click can't authorize twice.
  const attemptKey = useRef<string>("");

  const onDatesChange = useCallback(
    (ci: string | undefined, co: string | undefined) => {
      setCheckIn(ci);
      setCheckOut(co);
    },
    [],
  );

  // Live server quote.
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuote(null);
      setQuoteState("idle");
      return;
    }
    const controller = new AbortController();
    setQuoteState("loading");
    setQuoteError(null);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/booking/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitSlug: slug,
            checkIn,
            checkOut,
            guests,
            pets,
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setQuote(null);
          setQuoteState("error");
          setQuoteError(data.error ?? "Could not price these dates.");
          return;
        }
        setQuote(data.quote);
        setPolicies(data.policies);
        setQuoteState(data.available ? "ok" : "unavailable");
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setQuoteState("error");
          setQuoteError("Could not price these dates right now.");
        }
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [slug, checkIn, checkOut, guests, pets]);

  if (unit.directBookingEnabled === false) {
    return (
      <div className="booking-panel p-6 space-y-3">
        <h3 className="font-serif text-2xl font-semibold text-brand-forest">
          Plan your stay
        </h3>
        <p className="text-brand-charcoal/80">
          {unit.name} is booked by request. Tell us your dates and group size
          and we&apos;ll put together a quote.
        </p>
        <a
          href={`/booking-request?unit=${encodeURIComponent(slug)}`}
          className="btn btn-primary w-full text-center"
        >
          Send an inquiry
        </a>
      </div>
    );
  }

  const detailsValid =
    guestName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim()) &&
    guestPhone.replace(/\D/g, "").length >= 7 &&
    accepted;

  async function submit() {
    if (!quote || !cardRef.current) return;
    setSubmitting(true);
    setError(null);
    try {
      if (!attemptKey.current) attemptKey.current = crypto.randomUUID();
      const [givenName, ...rest] = guestName.trim().split(/\s+/);
      const card = await cardRef.current.tokenize({
        amountCents: quote.totalCents,
        givenName,
        familyName: rest.join(" "),
        email: guestEmail.trim(),
        phone: guestPhone.trim(),
      });
      const res = await fetch("/api/booking/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstileToken: humanToken,
          unitSlug: slug,
          checkIn: quote.checkIn,
          checkOut: quote.checkOut,
          guests: quote.guests,
          pets: quote.pets,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          specialRequests: message.trim() || null,
          acceptedPolicies: accepted,
          sourceId: card.sourceId,
          verificationToken: card.verificationToken,
          idempotencyKey: attemptKey.current,
          expectedTotalCents: quote.totalCents,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push(
          `/booking/confirmation/${encodeURIComponent(data.confirmationCode)}`,
        );
        return;
      }
      // Each failed attempt gets a fresh key (a new card token is required anyway).
      attemptKey.current = "";
      if (data.code === "price_changed" && data.quote) {
        setQuote(data.quote);
        setError(`${data.error} New total: ${money(data.quote.totalCents)}.`);
      } else if (data.code === "dates_taken") {
        setError(data.error);
        setCheckIn(undefined);
        setCheckOut(undefined);
        setCalendarKey((k) => k + 1);
        setStep("dates");
      } else {
        setError(
          data.error ?? "Something went wrong. Your card was not charged.",
        );
      }
    } catch (e) {
      attemptKey.current = "";
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Your card was not charged.",
      );
    } finally {
      setHumanToken("");
      setHumanAttempt((n) => n + 1);
      setSubmitting(false);
    }
  }

  const steps: { id: Step; label: string }[] = [
    { id: "dates", label: "Dates" },
    { id: "details", label: "Details" },
    { id: "payment", label: "Request" },
  ];
  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="booking-panel overflow-hidden">
      <div className="border-b border-brand-sand p-5 sm:p-6">
        <div className="font-serif text-2xl font-semibold">
          {unit.basePrice > 0 ? (
            <>
              From {money(Math.round(unit.basePrice * 100))}{" "}
              <span className="text-base font-normal">/ night</span>
            </>
          ) : (
            "Book your stay"
          )}
        </div>
        <div className="text-brand-stone text-sm mt-2">
          {unit.name}
          {minStay > 1 ? ` · ${minStay}-night minimum` : ""} · Sleeps{" "}
          {unit.maxGuests}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <h2 ref={heading} tabIndex={-1} className="text-2xl scroll-mt-28">
          {step === "dates"
            ? "Request your stay"
            : step === "details"
              ? "Your details"
              : "Review and send"}
        </h2>
        <p className="text-sm leading-relaxed">
          We’ll reply within {policies?.requestResponseHours ?? responseHours}{" "}
          hours. Sending a request places a card hold; you’re charged only after
          we confirm.
        </p>
        <ol
          className="grid grid-cols-3 gap-2 border-b border-brand-sand pb-4 text-xs"
          aria-label="Booking steps"
        >
          {steps.map((s, i) => (
            <li
              key={s.id}
              aria-current={i === stepIndex ? "step" : undefined}
              className={
                i === stepIndex
                  ? "text-brand-forest font-semibold"
                  : "text-brand-stone"
              }
            >
              <span className="mr-1.5">
                {i < stepIndex ? "✓" : `${i + 1}.`}
              </span>
              {s.label}
            </li>
          ))}
        </ol>

        {error && (
          <div
            role="alert"
            className="p-4 bg-red-50 border border-red-200 rounded-sm text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {step === "dates" && (
          <div className="space-y-5">
            <DatePicker
              unitSlug={slug}
              minStay={minStay}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={onDatesChange}
              refreshKey={calendarKey}
            />
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-brand-charcoal mb-1">
                  Guests
                </div>
                <GuestSelector
                  value={guests}
                  onChange={setGuests}
                  max={unit.maxGuests || 1}
                />
              </div>
              {unit.petsAllowed && maxPets > 0 && (
                <div>
                  <div className="text-sm font-medium text-brand-charcoal mb-1">
                    Pets
                  </div>
                  <GuestSelector
                    value={pets}
                    onChange={setPets}
                    min={0}
                    max={maxPets}
                    singularLabel="pet"
                    pluralLabel="pets"
                  />
                </div>
              )}
            </div>

            {guests > unit.maxGuests && (
              <p role="alert" className="text-sm text-red-800">
                Your search was for {guests} guests. This stay sleeps{" "}
                {unit.maxGuests}; change the group size or{" "}
                <a className="underline" href="/book-the-farm">
                  consider the Farm
                </a>
                .
              </p>
            )}
            <PriceSummary
              quote={quote}
              state={quoteState}
              error={quoteError}
              checkIn={checkIn}
              checkOut={checkOut}
            />

            <button
              type="button"
              disabled={quoteState !== "ok" || guests > unit.maxGuests}
              onClick={() => {
                setError(null);
                setStep("details");
              }}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
            <p className="text-xs text-center text-brand-stone">
              You won&apos;t be charged yet.
            </p>
          </div>
        )}

        {step === "details" && quote && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (detailsValid) setStep("payment");
            }}
          >
            <StaySummary quote={quote} />
            <Field
              label="Full name"
              value={guestName}
              onChange={setGuestName}
              autoComplete="name"
              required
            />
            <Field
              label="Email"
              type="email"
              value={guestEmail}
              onChange={setGuestEmail}
              autoComplete="email"
              required
            />
            <Field
              label="Phone"
              type="tel"
              value={guestPhone}
              onChange={setGuestPhone}
              autoComplete="tel"
              required
            />
            <label className="block">
              <span className="text-sm font-medium text-brand-charcoal">
                Message to your hosts (optional)
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Who's coming, arrival time, anything we should know"
                className="mt-1 w-full rounded-sm border border-brand-sand p-3"
              />
            </label>

            <Policies policies={policies} />
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1"
                required
              />
              <span>I agree to the cancellation policy and house rules.</span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("dates")}
                className="btn btn-outline flex-1"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!detailsValid}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {step === "payment" && quote && (
          <div className="space-y-4">
            <StaySummary quote={quote} />
            <div className="rounded-sm bg-brand-cream border border-brand-sand p-4 text-sm text-brand-charcoal">
              <strong>How booking works:</strong> we place a hold of{" "}
              {money(quote.totalCents)} on your card and review your request
              within {policies?.requestResponseHours ?? responseHours} hours.
              You&apos;re charged only when we confirm. If we can&apos;t host
              you, the hold is released.
            </div>
            <HumanCheck
              action="booking"
              onToken={setHumanToken}
              attempt={humanAttempt}
            />
            <SquarePayment ref={cardRef} onReadyChange={setCardReady} />
            <div className="flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep("details")}
                className="btn btn-outline flex-1"
              >
                Back
              </button>
              <button
                type="button"
                disabled={
                  !cardReady ||
                  submitting ||
                  (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !humanToken)
                }
                onClick={submit}
                className="btn btn-primary flex-[2] disabled:opacity-50"
              >
                {submitting
                  ? "Sending request…"
                  : `Request to book · ${money(quote.totalCents)}`}
              </button>
            </div>
            <p className="text-xs text-center text-brand-stone">
              Payments are processed securely by Square.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-brand-charcoal">
        {props.label}
      </span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete}
        required={props.required}
        className="mt-1 w-full rounded-sm border border-brand-sand p-3"
      />
    </label>
  );
}

function StaySummary({ quote }: { quote: Quote }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-2 text-sm rounded-sm bg-brand-cream/60 p-3">
      <span className="min-w-0 flex-1 basis-40">
        {pretty(quote.checkIn)} → {pretty(quote.checkOut)} · {quote.guests}{" "}
        guest{quote.guests > 1 ? "s" : ""}
        {quote.pets ? ` · ${quote.pets} pet${quote.pets > 1 ? "s" : ""}` : ""}
      </span>
      <strong className="whitespace-nowrap">{money(quote.totalCents)}</strong>
    </div>
  );
}

function PriceSummary({
  quote,
  state,
  error,
  checkIn,
  checkOut,
}: {
  quote: Quote | null;
  state: string;
  error: string | null;
  checkIn?: string;
  checkOut?: string;
}) {
  if (!checkIn || !checkOut) return null;
  if (state === "loading" && !quote)
    return <p className="text-sm text-brand-stone">Checking price…</p>;
  if (state === "error") return <p className="text-sm text-red-700">{error}</p>;
  if (!quote) return null;

  const avg = Math.round(quote.lodgingCents / quote.numNights);
  const varied = new Set(quote.nights.map((n) => n.rateCents)).size > 1;
  return (
    <div
      className={`rounded-sm border border-brand-sand p-4 space-y-2 text-sm ${state === "loading" ? "opacity-60" : ""}`}
    >
      {state === "unavailable" && (
        <p className="text-red-700 font-medium">
          Those dates were just taken. Please pick different dates.
        </p>
      )}
      <Row
        label={`${varied ? "Avg. " : ""}${money(avg)} × ${quote.numNights} night${quote.numNights > 1 ? "s" : ""}`}
        value={quote.lodgingCents}
      />
      {quote.extraGuestCents > 0 && (
        <Row
          label={`Extra guests (${quote.extraGuests})`}
          value={quote.extraGuestCents}
        />
      )}
      {quote.petCents > 0 && <Row label="Pet fee" value={quote.petCents} />}
      {quote.cleaningCents > 0 && (
        <Row label="Cleaning fee" value={quote.cleaningCents} />
      )}
      {quote.taxes.map((t) => (
        <Row
          key={t.name}
          label={`${t.name} (${t.ratePercent}%)`}
          value={t.amountCents}
        />
      ))}
      <div className="border-t border-brand-sand pt-2 flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>{money(quote.totalCents)}</span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-brand-charcoal/80">{label}</span>
      <span className="whitespace-nowrap">{money(value)}</span>
    </div>
  );
}

function Policies({ policies }: { policies: GuestPolicies | null }) {
  if (!policies) return null;
  const times = [
    policies.checkInTime && `Check-in ${policies.checkInTime}`,
    policies.checkOutTime && `check-out ${policies.checkOutTime}`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="space-y-2 text-sm">
      {times && <p className="text-brand-charcoal/80">{times}</p>}
      {policies.cancellationPolicy && (
        <details className="rounded-sm border border-brand-sand p-3" open>
          <summary className="font-medium cursor-pointer">
            Cancellation policy
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-brand-charcoal/80">
            {policies.cancellationPolicy}
          </p>
        </details>
      )}
      {policies.houseRules && (
        <details className="rounded-sm border border-brand-sand p-3">
          <summary className="font-medium cursor-pointer">House rules</summary>
          <p className="mt-2 whitespace-pre-wrap text-brand-charcoal/80">
            {policies.houseRules}
          </p>
        </details>
      )}
    </div>
  );
}
