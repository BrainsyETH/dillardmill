import Link from 'next/link';
import { getReviews } from '@/lib/sanity/queries';
import type { Review } from '@/lib/sanity/schemas';

export const metadata = {
  title: 'Guest Reviews | Pine Valley at Dillard Mill',
  description:
    'Read verified reviews from guests who have stayed at Pine Valley at Dillard Mill.',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-brand-copper' : 'text-brand-sand'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatMonthYear(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

async function loadReviews(): Promise<Review[]> {
  try {
    return await getReviews();
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await loadReviews();

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews
      : null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-brand-forest text-brand-cream py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
              WHAT OUR GUESTS SAY
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-brand-cream">
              Guest Reviews
            </h1>
            <p className="text-xl text-brand-sand/90 leading-relaxed">
              Verified reviews from guests who have stayed at Pine Valley.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Rating summary — only shown if we actually have reviews */}
        {totalReviews > 0 && averageRating !== null && (
          <div className="bg-gradient-to-br from-brand-cream to-brand-sand/30 rounded-2xl p-8 md:p-12 mb-16 border border-brand-sand">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="font-serif text-6xl md:text-7xl font-bold text-brand-forest mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center md:justify-start mb-2">
                  <StarRating rating={Math.round(averageRating)} />
                </div>
                <div className="text-brand-stone">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.airbnb.com/rooms/44360355"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Read on Airbnb
                </a>
                <a
                  href="https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Read on Hipcamp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {totalReviews > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <article key={review._id} className="card p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-copper text-brand-cream flex items-center justify-center font-semibold text-lg flex-shrink-0">
                    {review.guestName?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-brand-forest">
                      {review.guestName}
                    </div>
                    <div className="text-sm text-brand-stone">
                      {formatMonthYear(review.reviewDate)}
                      {review.unit?.name ? ` · ${review.unit.name}` : ''}
                      {review.source ? ` · ${review.source}` : ''}
                    </div>
                  </div>
                </div>

                {typeof review.rating === 'number' && review.rating > 0 && (
                  <div className="mb-4">
                    <StarRating rating={review.rating} />
                  </div>
                )}

                <p className="text-brand-charcoal leading-relaxed italic">
                  &ldquo;{review.reviewText}&rdquo;
                </p>
              </article>
            ))}
          </div>
        ) : (
          // Honest empty state — no fabricated reviews. Points guests to real
          // sources on Airbnb / Hipcamp.
          <div className="max-w-2xl mx-auto text-center bg-brand-cream rounded-2xl p-10 border border-brand-sand">
            <div className="w-16 h-16 rounded-full bg-brand-copper/10 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-brand-copper"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-brand-forest mb-3">
              Reviews are coming soon
            </h2>
            <p className="text-brand-stone mb-6">
              We&apos;re gathering verified reviews from our guests. In the meantime,
              you can read reviews on the platforms we host with:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.airbnb.com/rooms/44360355"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Read on Airbnb
              </a>
              <a
                href="https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Read on Hipcamp
              </a>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-brand-stone text-lg mb-6">
            Ready to create your own Pine Valley memories?
          </p>
          <Link href="/lodging" className="btn btn-primary text-lg">
            Find a Stay
          </Link>
        </div>
      </div>
    </div>
  );
}
