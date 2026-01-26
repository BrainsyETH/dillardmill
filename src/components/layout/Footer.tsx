import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Pine Valley
            </h3>
            <p className="text-sm">
              Lodging, Camping, & Events
            </p>
            <p className="text-sm mt-2">
              43 acres in Missouri's Mark Twain National Forest near historic Dillard Mill
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/units" className="hover:text-white transition-colors">
                  Browse Rentals
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/area" className="hover:text-white transition-colors">
                  Local Area
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Guest Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:pinevalley@dillardmill.com"
                  className="hover:text-white transition-colors"
                >
                  pinevalley@dillardmill.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+13148434321"
                  className="hover:text-white transition-colors"
                >
                  (314) 843-4321
                </a>
              </li>
              <li className="text-sm">
                126 Dillard Mill Road
                <br />
                Davisville, MO 65456
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>
              &copy; {currentYear} Pine Valley. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/pinevalleydm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/pinevalley"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
