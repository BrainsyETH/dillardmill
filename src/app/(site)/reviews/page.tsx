import Link from "next/link";
import { getReviews } from "@/lib/stays/queries";
export const metadata = { title: "Guest notes | Pine Valley" };
export default async function Reviews() {
  const reviews = await getReviews();
  return (
    <div className="page-shell section-space">
      <p className="eyebrow mb-4">From our guests</p>
      <h1 className="page-title mb-10">Their time here.</h1>
      {reviews.length ? (
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
          {reviews.map((r) => (
            <figure className="border-t border-brand-sand pt-6" key={r._id}>
              <p className="text-sm mb-4">
                {r.rating} / 5 · {r.source}
              </p>
              <blockquote className="text-xl leading-relaxed">
                “{r.reviewText}”
              </blockquote>
              <figcaption className="mt-5 text-sm text-brand-stone">
                {r.guestName}
                {r.unit && ` · ${r.unit.name}`} ·{" "}
                {new Date(r.reviewDate).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="max-w-xl">
          <p className="text-lg leading-relaxed mb-6">
            You can read guest reviews on our Airbnb listing. If there’s
            something you’d like to know before choosing a stay, ask us
            directly.
          </p>
          <div className="flex flex-wrap gap-6">
            <a
              href="https://www.airbnb.com/rooms/44360355"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Read on Airbnb ↗
            </a>
            <Link href="/contact" className="text-link">
              Ask your hosts ↗
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
