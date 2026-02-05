'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Sample reviews - in production, these would come from Sanity CMS
const sampleReviews = [
  {
    id: 1,
    guestName: 'Sarah M.',
    rating: 5,
    date: 'January 2026',
    unit: 'The Original Airstream',
    text: 'Absolutely magical! The Airstream was spotless and cozy, and the outdoor soaking tub under the stars was an experience we\'ll never forget. The property is beautiful with great hiking trails. Can\'t wait to come back!',
    avatar: 'S',
  },
  {
    id: 2,
    guestName: 'Michael & Jennifer',
    rating: 5,
    date: 'December 2025',
    unit: 'Cozy Cottage',
    text: 'Perfect winter getaway! The cottage had everything we needed - full kitchen, comfortable beds, and the best part was sitting by the fire watching the snow fall. Walking to Dillard Mill was a highlight.',
    avatar: 'M',
  },
  {
    id: 3,
    guestName: 'The Thompson Family',
    rating: 5,
    date: 'November 2025',
    unit: 'Book the Farm',
    text: 'We booked the entire property for our family reunion and it exceeded all expectations. 20+ family members across the different units, private trails for hiking, fishing ponds for the kids - it was the perfect gathering spot!',
    avatar: 'T',
  },
  {
    id: 4,
    guestName: 'David R.',
    rating: 5,
    date: 'October 2025',
    unit: 'The Sebastian',
    text: 'The clawfoot tubs outside were such a unique touch. We loved disconnecting from technology and reconnecting with nature. The property managers were incredibly helpful and responsive.',
    avatar: 'D',
  },
  {
    id: 5,
    guestName: 'Amanda K.',
    rating: 5,
    date: 'September 2025',
    unit: 'The Original Airstream',
    text: 'If you\'re looking for a unique glamping experience, this is it! The attention to detail in the Airstream is incredible. The private deck, the outdoor tub, the peaceful surroundings - pure bliss.',
    avatar: 'A',
  },
  {
    id: 6,
    guestName: 'Chris & Laura',
    rating: 5,
    date: 'August 2025',
    unit: 'Cozy Cottage',
    text: 'We\'ve stayed at many vacation rentals, but Pine Valley is truly special. The cottage felt like a home away from home. The hiking trails on the property were perfect for our morning walks.',
    avatar: 'C',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-brand-copper' : 'text-brand-sand'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const averageRating = 5.0;
  const totalReviews = sampleReviews.length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-forest to-brand-forest/90 text-brand-cream py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-copper/10 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
              WHAT OUR GUESTS SAY
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
              Guest Reviews
            </h1>
            <p className="text-xl text-brand-sand/90 leading-relaxed">
              Read what our guests have to say about their stay at Pine Valley.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-brand-cream to-brand-sand/30 rounded-2xl p-8 md:p-12 mb-16 border border-brand-sand"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="font-serif text-6xl md:text-7xl font-bold text-brand-forest mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center md:justify-start mb-2">
                <StarRating rating={5} />
              </div>
              <div className="text-brand-stone">
                Based on {totalReviews} reviews
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.airbnb.com/users/show/309588444"
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
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sampleReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card p-6 md:p-8"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-copper text-brand-cream flex items-center justify-center font-semibold text-lg flex-shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-brand-forest">{review.guestName}</div>
                  <div className="text-sm text-brand-stone">{review.date} · {review.unit}</div>
                </div>
              </div>

              <div className="mb-4">
                <StarRating rating={review.rating} />
              </div>

              <p className="text-brand-charcoal leading-relaxed italic">
                "{review.text}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-brand-stone text-lg mb-6">
            Ready to create your own Pine Valley memories?
          </p>
          <Link href="/lodging" className="btn btn-primary text-lg">
            Book Your Stay
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
