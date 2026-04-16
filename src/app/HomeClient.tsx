'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PropertyMapDynamic } from '@/components/map';

export interface HomeUnit {
  name: string;
  href: string;
  description: string;
  features: string[];
  imageUrl?: string;
  imageAlt?: string;
  gradient: string;
}

export interface HomeReview {
  text: string;
  guestName: string;
  rating: number;
}

export interface HomeImage {
  url: string;
  alt: string;
}

interface HomeClientProps {
  units: HomeUnit[];
  review: HomeReview | null;
  heroImage?: HomeImage | null;
  experienceImages?: HomeImage[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home({ units, review, heroImage, experienceImages = [] }: HomeClientProps) {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center gradient-hero text-white overflow-hidden">
        {/* Background photo (when available) */}
        {heroImage && (
          <Image
            src={heroImage.url}
            alt={heroImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          {/* Darkening overlay for legibility over the photo (or gradient fallback) */}
          <div className={`absolute inset-0 ${
            heroImage
              ? 'bg-gradient-to-br from-brand-forest/80 via-brand-forest/60 to-brand-forest/30'
              : 'bg-gradient-to-br from-brand-forest/90 via-brand-forest/70 to-transparent'
          }`} />

          {!heroImage && (
            <>
              <div className="absolute top-20 right-10 w-72 h-72 bg-brand-copper/10 rounded-full blur-3xl" />
              <div className="absolute bottom-20 left-10 w-96 h-96 bg-brand-sage/20 rounded-full blur-3xl" />
              <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                <pattern id="heroPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="1.5" fill="currentColor" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#heroPattern)" />
              </svg>
            </>
          )}
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <motion.div 
            className="max-w-3xl"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Tagline */}
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="w-2 h-2 bg-brand-copper rounded-full animate-pulse" />
              <span className="text-sm font-medium tracking-wide">43 Acres in Mark Twain National Forest</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold mb-6 leading-[0.95] text-white"
            >
              Pine Valley
              <span className="block text-brand-sage text-3xl sm:text-4xl md:text-5xl font-normal mt-2">
                at Dillard Mill
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-white/90 mb-10 max-w-xl leading-relaxed font-light"
            >
              Escape to the Ozarks. Vintage Airstreams, cozy cottages, and 
              unforgettable experiences in Missouri&apos;s most beautiful landscape.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/lodging" className="btn btn-primary text-lg px-8 py-4">
                View Accommodations
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/the-area" className="btn btn-outline-light text-lg px-8 py-4">
                Explore the Area
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              className="mt-12 pt-8 border-t border-white/20 flex flex-wrap gap-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">5-Star Rated</div>
                  <div className="text-sm text-white/60">Guest Reviews</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">43 Acres</div>
                  <div className="text-sm text-white/60">Private Forest</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Historic</div>
                  <div className="text-sm text-white/60">Dillard Mill</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Property Features */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-copper via-brand-sage to-brand-copper opacity-30" />
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                stat: '43',
                unit: 'Acres',
                title: 'Private Land',
                description: 'Surrounded by Mark Twain National Forest with private hiking trails and fishing ponds'
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
                stat: 'Unique',
                unit: '',
                title: 'Accommodations',
                description: 'Vintage Airstreams, cozy cottages, and full-property rentals for groups and events'
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                stat: '1908',
                unit: '',
                title: 'Historic Dillard Mill',
                description: "Walking distance to Missouri's best-preserved gristmill and scenic Huzzah Creek"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-sage/30 to-brand-sage/10 text-brand-forest mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div className="font-serif text-5xl font-bold text-brand-forest mb-1">
                  {feature.stat}
                  <span className="text-brand-copper">{feature.unit}</span>
                </div>
                <h3 className="text-xl font-semibold text-brand-forest mb-3">{feature.title}</h3>
                <p className="text-brand-stone leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Units Preview */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
              WHERE WILL YOU STAY?
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-brand-forest mb-4">
              Our Accommodations
            </h2>
            <p className="text-xl text-brand-stone max-w-2xl mx-auto">
              From vintage Airstreams to cozy cottages, each space offers a unique retreat 
              in the heart of the Ozarks
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {units.map((unit, index) => (
              <motion.div
                key={unit.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={unit.href} className="group block">
                  <div className="card overflow-hidden">
                    <div className={`h-64 relative overflow-hidden ${unit.imageUrl ? '' : `bg-gradient-to-br ${unit.gradient}`}`}>
                      {unit.imageUrl && (
                        <Image
                          src={unit.imageUrl}
                          alt={unit.imageAlt ?? unit.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex gap-2 flex-wrap">
                          {unit.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-brand-forest"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-serif text-2xl font-semibold text-brand-forest mb-2 group-hover:text-brand-copper transition-colors">
                        {unit.name}
                      </h3>
                      <p className="text-brand-stone mb-4 line-clamp-2">
                        {unit.description}
                      </p>
                      <span className="inline-flex items-center gap-2 text-brand-copper font-semibold group-hover:gap-3 transition-all">
                        Learn More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/lodging" className="btn btn-outline">
              View All Accommodations
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 bg-brand-forest text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-copper/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brand-sage/20 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
                EXPERIENCE THE OZARKS
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6 text-white">
                More Than Just a Stay
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Pine Valley sits on 43 private acres in Mark Twain National Forest. 
                Wake up to birdsong, explore hiking trails, fish in our ponds, 
                swim in Huzzah Creek, and visit the historic Dillard Mill just steps away.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { label: 'Hiking Trails', icon: '🥾' },
                  { label: 'Fishing Ponds', icon: '🎣' },
                  { label: 'Creek Swimming', icon: '🏊' },
                  { label: 'Stargazing', icon: '✨' },
                  { label: 'Historic Mill', icon: '🏛️' },
                  { label: 'Campfires', icon: '🔥' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-white/90">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/the-area" className="btn btn-primary">
                  Explore Local Attractions
                </Link>
                <Link href="/contact" className="btn btn-outline-light">
                  Contact Us
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Image grid — real photos when available, gradient tiles otherwise */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <ExperienceTile
                    image={experienceImages[0]}
                    className="h-48"
                    fallback="bg-gradient-to-br from-brand-sage/40 to-brand-sage/20"
                  />
                  <ExperienceTile
                    image={experienceImages[1]}
                    className="h-64"
                    fallback="bg-gradient-to-br from-brand-copper/30 to-brand-copper/10"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <ExperienceTile
                    image={experienceImages[2]}
                    className="h-64"
                    fallback="bg-gradient-to-br from-brand-sky/30 to-brand-sky/10"
                  />
                  <ExperienceTile
                    image={experienceImages[3]}
                    className="h-48"
                    fallback="bg-gradient-to-br from-white/20 to-white/5"
                  />
                </div>
              </div>
              
              {review && (
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl max-w-xs">
                  <div className="flex text-brand-copper mb-3">
                    {Array.from({ length: Math.round(review.rating) }).map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-brand-charcoal text-sm italic line-clamp-4">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <p className="text-brand-stone text-xs mt-2">— {review.guestName}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Where We Are */}
      <section className="py-20 bg-brand-cream">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-header justify-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-forest px-6">
                Where We Are
              </h2>
            </div>
            <PropertyMapDynamic variant="embedded" />
            <div className="mt-6 text-center">
              <p className="text-brand-charcoal font-medium">126 Dillard Mill Road</p>
              <p className="text-brand-stone text-sm">Davisville, MO 65456</p>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 mt-3 text-brand-copper font-semibold hover:text-brand-copper-dark transition-colors"
              >
                View Full Map
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-white to-brand-sand/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-brand-forest mb-6">
              Ready for Your Ozark Escape?
            </h2>
            <p className="text-xl text-brand-stone mb-10">
              Book direct or through your favorite platform. Either way,
              we can&apos;t wait to welcome you to Pine Valley.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/lodging" className="btn btn-primary text-lg px-10 py-4">
                Book Direct
              </Link>
              <a 
                href="https://www.airbnb.com/rooms/44360355"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline text-lg px-10 py-4"
              >
                View on Airbnb
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function ExperienceTile({
  image,
  className,
  fallback,
}: {
  image?: HomeImage;
  className: string;
  fallback: string;
}) {
  if (!image) {
    return <div className={`${className} ${fallback} rounded-2xl`} />;
  }
  return (
    <div className={`${className} relative rounded-2xl overflow-hidden`}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
        className="object-cover"
      />
    </div>
  );
}
