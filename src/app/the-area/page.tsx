'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const attractions = [
  {
    name: 'Dillard Mill State Historic Site',
    distance: 'Walking Distance',
    description: 'A restored gristmill from 1908 located on Huzzah Creek. One of Missouri\'s best-preserved gristmills with original machinery intact. Visitors can fish, hike, and picnic along the scenic Ozark waterway.',
    icon: '🏛️',
    gradient: 'from-brand-copper/20 to-brand-copper/5',
  },
  {
    name: 'Mark Twain National Forest',
    distance: 'On Property',
    description: 'Expansive forest system offering extensive outdoor recreation with over 750 miles of trails for hiking, horseback riding, mountain biking, and motorized use with varying difficulty levels.',
    icon: '🌲',
    gradient: 'from-brand-sage/20 to-brand-sage/5',
  },
  {
    name: 'Huzzah Creek',
    distance: '0.5 Miles (trail from entrance)',
    description: 'A clearwater stream approximately 100 miles from St. Louis that eventually joins the Meramec River. Perfect for floating, fishing, and enjoying Missouri\'s natural beauty.',
    icon: '🏊',
    gradient: 'from-brand-stone/20 to-brand-stone/5',
  },
  {
    name: 'Viburnum Country Club',
    distance: 'Nearby',
    description: 'Golf facility north of Viburnum featuring multiple tee lengths and scenic terrain suitable for both beginners and experienced players.',
    icon: '⛳',
    gradient: 'from-brand-sand/40 to-brand-sand/10',
  },
];

const onPropertyFeatures = [
  {
    title: 'Hiking Trails',
    description: 'Explore 1.5-2 miles of private hiking trails winding through our 43 acres of forested land.',
    icon: '🥾',
  },
  {
    title: 'Fishing Ponds',
    description: 'Two ponds stocked for fishing, perfect for a relaxing afternoon catching bass and bluegill.',
    icon: '🎣',
  },
  {
    title: 'Campfire Areas',
    description: 'Multiple designated campfire spots with seating for evening gatherings under the stars.',
    icon: '🔥',
  },
  {
    title: 'Wildlife Viewing',
    description: 'Observe deer, wild turkey, owls, and countless bird species in their natural habitat.',
    icon: '🦌',
  },
  {
    title: 'Star Gazing',
    description: 'Far from city lights, enjoy some of the darkest skies in Missouri for spectacular stargazing.',
    icon: '✨',
  },
  {
    title: 'Peace & Quiet',
    description: 'No highway noise, no neighbors—just the sounds of nature surrounding your private retreat.',
    icon: '🍃',
  },
];

export default function AreaPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-forest to-brand-forest/90 text-brand-cream py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-sage/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brand-copper/10 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
              DISCOVER THE OZARKS
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
              Explore the Area
            </h1>
            <p className="text-xl text-brand-sand/90 leading-relaxed">
              Discover the beauty and attractions near Pine Valley, from historic sites
              to outdoor adventures in the Missouri Ozarks.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Local Attractions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-header justify-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-forest px-6">
              Nearby Attractions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {attractions.map((attraction, index) => (
              <motion.div
                key={attraction.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card overflow-hidden"
              >
                <div className={`h-48 bg-gradient-to-br ${attraction.gradient} flex items-center justify-center`}>
                  <span className="text-6xl">{attraction.icon}</span>
                </div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 bg-brand-copper/10 text-brand-copper text-sm font-medium rounded-full mb-3">
                    {attraction.distance}
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-brand-forest mb-3">
                    {attraction.name}
                  </h3>
                  <p className="text-brand-charcoal leading-relaxed">
                    {attraction.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* On Property Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24"
        >
          <div className="bg-gradient-to-br from-brand-cream to-brand-sand/30 rounded-3xl p-10 md:p-14 border border-brand-sand">
            <div className="text-center mb-12">
              <span className="inline-block text-brand-copper font-medium tracking-wide mb-4">
                RIGHT HERE AT PINE VALLEY
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-forest">
                On the Property
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {onPropertyFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-4 text-3xl">
                    {feature.icon}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-brand-forest mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-brand-stone text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Map Section Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24"
        >
          <div className="section-header justify-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-forest px-6">
              Where We Are
            </h2>
          </div>

          <div className="bg-gradient-to-br from-brand-sand/50 to-brand-sage/10 rounded-2xl h-80 flex items-center justify-center border border-brand-sand">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-copper/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-brand-charcoal font-medium mb-2">126 Dillard Mill Road</p>
              <p className="text-brand-stone">Davisville, MO 65456</p>
              <a
                href="https://maps.google.com/?q=Dillard+Mill+State+Historic+Site+Missouri"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-brand-copper hover:text-brand-copper-dark font-medium transition-colors"
              >
                Open in Google Maps
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24"
        >
          <div className="bg-brand-forest rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-copper/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brand-sage/20 to-transparent" />
            
            <div className="relative">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-cream mb-4">
                Plan Your Visit
              </h2>
              <p className="text-xl text-brand-sand/90 mb-8 max-w-2xl mx-auto">
                Experience all that Pine Valley and the Missouri Ozarks have to offer.
                Book your stay and start your adventure.
              </p>
              <Link href="/lodging" className="btn btn-primary text-lg">
                View Accommodations
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
