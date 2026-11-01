import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/content/property";
import { weddingPackages } from "@/lib/events/content";
import { tourBookingUrl } from "@/lib/events/config";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { EventInquiryForm } from "./EventInquiryForm";
const spaces = [
  {
    name: "By the creek",
    image: "bb46c51f3e11",
    detail:
      "Private access to Huzzah Creek, with a gravel bar and room to gather outdoors.",
  },
  {
    name: "The courtyard",
    image: "819922e5ba54",
    detail: "At the center of the Farm, beside the barn and the café patio.",
  },
  {
    name: "The barn",
    image: "b5b288c7c8fb",
    detail: "A gravel ground floor, with a dance floor and stage in the loft.",
  },
  {
    name: "The TT Café",
    image: "24fc9addd29c",
    detail: "A large kitchen and indoor dining space seating 30.",
  },
];
export function EventPage({
  wedding = true,
  preview = false,
}: {
  wedding?: boolean;
  preview?: boolean;
}) {
  const tour = tourBookingUrl();
  return (
    <div className="page-shell pt-8 pb-16">
      <p className="eyebrow mb-4">Pine Valley · Davisville, Missouri</p>
      <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
        <div className="max-w-3xl">
          <h1 className="page-title mb-5">
            {wedding ? "Weddings at Pine Valley" : "Gather at Pine Valley"}
          </h1>
          <p className="text-lg max-w-2xl">
            {wedding
              ? "A weekend by the creek, with your people staying close."
              : "Family reunions, retreats and celebrations at Pine Valley."}
          </p>
        </div>
        <a href="#event-inquiry" className="btn btn-primary">
          Ask about your date
        </a>
      </div>
      <GalleryGrid
        images={[
          "819922e5ba54",
          "bb46c51f3e11",
          "b5b288c7c8fb",
          "a8f9b6b40a71",
          "24fc9addd29c",
          "9865f95f18c5",
        ].map(photo)}
        compact
      />
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-7 border-b border-brand-sand">
        {[
          ["100", "Event guests maximum"],
          ["8", "Places to stay"],
          [
            wedding ? "From $2,800" : "By arrangement",
            wedding ? "Wedding packages" : "Private events",
          ],
          ["2–3 nights", "Wedding weekends"],
        ].map(([value, label]) => (
          <div key={label}>
            <dt className="text-sm text-brand-stone">{label}</dt>
            <dd className="font-serif text-3xl sm:text-4xl mt-2">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="py-12 lg:py-16" aria-labelledby="spaces-title">
        <h2 className="section-title mb-8" id="spaces-title">
          Places to gather.
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-7 gap-y-9">
          {spaces.map((s) => (
            <article key={s.name}>
              <div className="relative aspect-[16/10]">
                <Image
                  src={photo(s.image).src}
                  alt={photo(s.image).alt}
                  fill
                  sizes="(max-width: 639px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <h3 className="text-3xl mt-4 mb-2">{s.name}</h3>
              <p className="max-w-xl">{s.detail}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 border-l-2 border-brand-copper pl-4 max-w-3xl">
          <strong>Weather:</strong> No rain backup is provided. The café seats
          30; it cannot accommodate a 100-person reception.
        </p>
      </section>
      {wedding && (
        <section
          id="packages"
          className="border-y border-brand-sand py-12 scroll-mt-28"
          aria-labelledby="packages-title"
        >
          <div className="flex flex-wrap justify-between gap-4 items-end mb-9">
            <h2 className="section-title" id="packages-title">
              Wedding weekends.
            </h2>
            <a
              className="text-link"
              href={preview ? "/admin/events/brochure" : "/weddings/brochure"}
            >
              Download the brochure ↓
            </a>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {weddingPackages.map((p, i) => (
              <article
                key={p.id}
                className="border-t-2 border-brand-forest pt-5"
              >
                <p className="eyebrow mb-4">
                  0{i + 1} / {p.nights} nights
                </p>
                <h3 className="text-3xl mb-3">{p.name}</h3>
                <p className="font-serif text-4xl mb-3">
                  ${p.price.toLocaleString("en-US")}
                </p>
                <p className="text-sm">{p.stay}</p>
                <p className="font-medium mt-5">Up to 100 event guests</p>
                <p className="text-sm mt-2">{p.lodging}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="text-sm text-brand-stone mt-8">
            We’ll confirm availability, taxes and your full quote before
            booking.
          </p>
        </section>
      )}
      <section className="grid lg:grid-cols-2 gap-8 py-12 lg:py-16">
        <div>
          <h2 className="section-title mb-5">Stay on the Farm.</h2>
          <p className="text-lg max-w-xl">
            The cottage, restored trailers, tiny cabins and café sleeping space
            put your closest people on the property.
          </p>
          <p className="mt-4 max-w-xl">
            Eight accommodations sleep up to 28. Camping brings total overnight
            capacity to 50. Some stays use shared bathrooms; the Airstream and
            Sebastian have outdoor bathing.
          </p>
          <Link href="/book-the-farm" className="text-link inline-block mt-6">
            See the accommodations ↗
          </Link>
        </div>
        <div className="border-t border-brand-sand pt-6">
          <h3 className="text-3xl mb-4">A ceremony at Dillard Mill</h3>
          <p>
            The neighboring state historic site handles its own ceremony
            permits. A Farm reservation does not reserve the mill grounds.
          </p>
          <a
            href="https://mostateparks.com/page/dillard-mill-state-historic-site/weddings-dillard-mill"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link inline-block mt-5"
          >
            Ceremony details from Missouri State Parks ↗
          </a>
        </div>
      </section>
      <section className="border-t border-brand-sand py-10">
        <h2 className="text-3xl mb-6">Good to know.</h2>
        <div className="max-w-3xl">
          {[
            [
              "Can we choose our vendors?",
              "Yes. Bring your own caterer and vendors. Tell us what you have planned when you inquire.",
            ],
            [
              "Where do guests park?",
              "Free, self-serve grass parking is available on the property.",
            ],
            ["Can we visit first?", "Yes. Get in touch to arrange a tour."],
            [
              "What about accessibility?",
              "Tell us about your group’s access needs before booking so we can confirm suitable spaces and routes.",
            ],
            [
              "What happens after we inquire?",
              "We’ll confirm availability and discuss your event. Sending the form does not reserve dates or take a payment.",
            ],
          ].map(([q, a]) => (
            <details key={q} className="border-b border-brand-sand py-4">
              <summary className="font-medium">{q}</summary>
              <p className="mt-3 max-w-2xl">{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section
        id="event-inquiry"
        className="grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-16 border-t border-brand-sand pt-12 scroll-mt-28"
      >
        <div>
          <h2 className="section-title mb-5">Tell us what you’re planning.</h2>
          <p className="mb-6">
            Have a date in mind, or still working it out? Either is fine.
          </p>
          <a href="tel:+13148434321" className="text-link">
            (314) 843-4321
          </a>
          <p className="mt-3">
            <a
              href="mailto:pinevalley@dillardmill.com"
              className="text-link break-all"
            >
              pinevalley@dillardmill.com
            </a>
          </p>
          {tour && (
            <a href={tour} className="btn btn-outline mt-7">
              Book a tour ↗
            </a>
          )}
          <p className="mt-8 text-sm">
            <Link
              href={
                preview
                  ? `/admin/events/preview?type=${wedding ? "events" : "wedding"}`
                  : wedding
                    ? "/events"
                    : "/weddings"
              }
              className="text-link"
            >
              {wedding
                ? "Planning another kind of gathering? ↗"
                : "Explore wedding weekends ↗"}
            </Link>
          </p>
        </div>
        <div className="booking-panel p-5 sm:p-8 min-w-0">
          <EventInquiryForm
            wedding={wedding}
            mode={preview ? "preview" : "public"}
          />
        </div>
      </section>
    </div>
  );
}
