'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    accommodations: [
      { label: 'All Lodging', href: '/lodging' },
      { label: 'Cozy Cottage', href: '/cozycottage' },
      { label: 'The Airstream', href: '/airstream' },
      { label: 'The Sebastian', href: '/sebastian' },
      { label: 'Book the Farm', href: '/book-the-farm' },
    ],
    explore: [
      { label: 'Photo Gallery', href: '/photos' },
      { label: 'The Area', href: '/the-area' },
      { label: 'Guest Reviews', href: '/reviews' },
      { label: 'Hiking Trails', href: '/trails' },
      { label: 'Our Thoughts', href: '/thoughts' },
    ],
    booking: [
      { label: 'View on Airbnb', href: 'https://www.airbnb.com/users/show/309588444', external: true },
      { label: 'View on Hipcamp', href: 'https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd', external: true },
      { label: 'Contact Us', href: '/contact' },
    ],
  };

  return (
    <footer className="bg-brand-forest text-white relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-brand-copper via-brand-sage to-brand-copper" />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link href="/" className="inline-block mb-4">
              <h3 className="font-serif text-3xl font-semibold text-white">
                Pine Valley
              </h3>
            </Link>
            <p className="text-brand-sage text-lg mb-2 font-light">
              Lodging, Camping, & Events
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              43 private acres in Missouri's Mark Twain National Forest, 
              steps from historic Dillard Mill.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com/pinevalleydm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-copper transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com/pinevalley"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-copper transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Accommodations Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-serif text-lg font-semibold mb-6 text-brand-sage">
              Accommodations
            </h4>
            <ul className="space-y-3">
              {footerLinks.accommodations.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Explore Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-serif text-lg font-semibold mb-6 text-brand-sage">
              Explore
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Booking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-serif text-lg font-semibold mb-6 text-brand-sage">
              Book Your Stay
            </h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.booking.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                    >
                      {link.label}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="pt-4 border-t border-white/10">
              <a
                href="mailto:pinevalley@dillardmill.com"
                className="text-brand-sage hover:text-white transition-colors text-sm block mb-2"
              >
                pinevalley@dillardmill.com
              </a>
              <a
                href="tel:+13148434321"
                className="text-brand-sage hover:text-white transition-colors text-sm block mb-3"
              >
                (314) 843-4321
              </a>
              <address className="text-white/60 text-sm not-italic leading-relaxed">
                126 Dillard Mill Road<br />
                Davisville, MO 65456
              </address>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-white/10 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © {currentYear} Pine Valley at Dillard Mill. All rights reserved.
            </p>
            <p className="text-white/40 text-xs">
              Nestled in the heart of Missouri's Ozarks
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
