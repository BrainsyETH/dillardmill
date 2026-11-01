"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { RentalUnit } from "@/lib/stays/types";
import {
  unitPhotos,
  stayDetails,
  sleepingArrangement,
} from "@/lib/content/property";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GuestMessageForm } from "@/components/forms/GuestMessageForm";
import { BookingForm } from "@/components/booking/BookingForm";

function RequestPanel({
  unit,
  responseHours,
}: {
  unit: RentalUnit;
  responseHours: number;
}) {
  const params = useSearchParams();
  const guests = Number(params.get("guests"));
  if (unit.directBookingEnabled === false)
    return (
      <div className="booking-panel p-5 sm:p-7">
        <h2 className="text-3xl mb-4">Ask about this stay</h2>
        <p className="mb-6 text-sm leading-relaxed">
          Send your dates and group size. We’ll reply with availability and a
          quote.
        </p>
        <GuestMessageForm
          kind="inquiry"
          unitSlug={unit.slug.current}
          initialCheckIn={params.get("checkIn") || ""}
          initialCheckOut={params.get("checkOut") || ""}
          initialGuests={params.get("guests") || ""}
          units={[{ slug: unit.slug.current, name: unit.name }]}
        />
      </div>
    );
  return (
    <BookingForm
      unit={unit}
      initialCheckIn={params.get("checkIn") || undefined}
      initialCheckOut={params.get("checkOut") || undefined}
      initialGuests={
        Number.isInteger(guests) && guests > 0 ? guests : undefined
      }
      initialPets={Number(params.get("pets")) || 0}
      responseHours={responseHours}
    />
  );
}
export function UnitDetail({
  unit,
  responseHours = 24,
}: {
  unit: RentalUnit;
  responseHours?: number;
}) {
  const panel = useRef<HTMLElement>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const info = stayDetails(unit.slug.current);
  const farm = Boolean(unit.isWholeProperty);
  useEffect(() => {
    if (!panel.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPanelVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="page-shell pt-7 pb-16">
      <nav aria-label="Breadcrumb" className="text-sm mb-7">
        <Link className="underline underline-offset-4" href="/lodging">
          Stays
        </Link>
        <span className="mx-3" aria-hidden="true">
          /
        </span>
        {unit.name}
      </nav>
      <div className="mb-7">
        <p className="eyebrow mb-3">
          {farm ? "Pine Valley, all together" : "Pine Valley at Dillard Mill"}
        </p>
        <h1 className="page-title mb-5">{unit.name}</h1>
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {farm ? (
            <>
              <span>8 accommodations</span>
              <span>Up to 50 guests with camping</span>
              <span>Private and shared bathrooms</span>
            </>
          ) : (
            <>
              <span>Sleeps {unit.maxGuests}</span>
              <span>{sleepingArrangement(unit)}</span>
              <span>{info?.bath || `${unit.bathrooms} bathrooms`}</span>
            </>
          )}
        </p>
      </div>
      <GalleryGrid images={unitPhotos(unit)} compact />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] gap-10 xl:gap-20 mt-10 lg:mt-14">
        <div>
          <h2 className="section-title mb-6">
            {farm ? "A weekend with everyone." : "Settle in."}
          </h2>
          <div className="prose-content text-lg">
            <p>{unit.shortDescription}</p>
          </div>
          {farm ? (
            <FarmDetails />
          ) : (
            <>
              <section className="mt-9 border-t border-brand-sand pt-8">
                <h2 className="text-3xl mb-5">The essentials</h2>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  {(unit.amenities || []).map((a) => (
                    <li
                      key={a._id || a.name}
                      className="pb-3 border-b border-brand-sand text-sm"
                    >
                      {a.name}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="mt-9">
                <h2 className="text-3xl mb-4">Before you choose</h2>
                <p className="leading-relaxed">
                  {info?.bath.includes("outdoor")
                    ? "Bathing is outdoors. You have a private indoor toilet and sink; please consider the weather and your comfort with outdoor bathing when choosing your stay."
                    : "If you have questions about steps, bathroom access, or anything your group needs, talk with us before making a request."}
                </p>
                <Link href="/contact" className="text-link inline-block mt-4">
                  Ask your hosts ↗
                </Link>
              </section>
            </>
          )}
          <section className="border-t border-brand-sand pt-8 mt-10">
            <h2 className="text-3xl mb-4">Around Pine Valley</h2>
            <p className="leading-relaxed">
              The courtyard, the walk to Dillard Mill, and our access to Huzzah
              Creek are part of the stay.
            </p>
            <div className="flex flex-wrap gap-6 mt-5">
              <Link href="/map" className="text-link">
                Property map ↗
              </Link>
              <Link href="/our-place" className="text-link">
                Explore the grounds ↗
              </Link>
            </div>
          </section>
          {(unit.airbnbUrl || unit.vrboUrl) && (
            <p className="text-sm mt-8">
              Also listed on{" "}
              {unit.airbnbUrl && (
                <a
                  href={unit.airbnbUrl}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Airbnb ↗
                </a>
              )}
              {unit.airbnbUrl && unit.vrboUrl && " and "}
              {unit.vrboUrl && (
                <a
                  href={unit.vrboUrl}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vrbo ↗
                </a>
              )}
            </p>
          )}
        </div>
        <aside id="stay-request" ref={panel} className="scroll-mt-28 min-w-0">
          <Suspense fallback={<p>Loading request form…</p>}>
            <RequestPanel unit={unit} responseHours={responseHours} />
          </Suspense>
        </aside>
      </div>
      <div className="border-t border-brand-sand mt-14 pt-8">
        <Link href="/lodging" className="text-link">
          ← Browse all stays
        </Link>
      </div>
      {!panelVisible && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-brand-cream border-t border-brand-sand p-3 flex justify-between items-center gap-4 lg:hidden shadow-sm">
          <span className="text-sm pl-2">{unit.name}</span>
          <a href="#stay-request" className="btn btn-primary shrink-0">
            {unit.directBookingEnabled === false
              ? "Ask about dates"
              : "Check dates"}
          </a>
        </div>
      )}
    </div>
  );
}
function FarmDetails() {
  return (
    <>
      <section className="mt-9 border-t border-brand-sand pt-8">
        <h2 className="text-3xl mb-5">What’s included</h2>
        <dl className="space-y-5">
          <div>
            <dt className="font-medium">Eight places to sleep</dt>
            <dd className="mt-1 leading-relaxed">
              The cottage, Original Airstream, Sebastian, Argosy, Sherman, two
              tiny cabins, and the “TT” Café’s sleeping space. Add camping for a
              larger group.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Places to gather</dt>
            <dd className="mt-1 leading-relaxed">
              The communal café kitchen, dining space for around 30, and the
              courtyard. Ask us about adding the barn for an event.
            </dd>
          </div>
          <div>
            <dt className="font-medium">A mix of bathroom arrangements</dt>
            <dd className="mt-1 leading-relaxed">
              Some stays have private plumbing; others use the shared bathhouse.
              The Original Airstream and Sebastian have outdoor bathing. We’ll
              help match rooms to your group’s needs.
            </dd>
          </div>
        </dl>
      </section>
      <section className="mt-9">
        <h2 className="text-3xl mb-4">Let’s work out the weekend.</h2>
        <p className="leading-relaxed">
          Tell us your dates, how many people will stay overnight, whether
          anyone will camp, and what you’re planning. We’ll confirm sleeping
          arrangements, spaces, and the full price together.
        </p>
      </section>
    </>
  );
}
