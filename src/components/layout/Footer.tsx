import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t border-brand-sand bg-[#e9ede4]">
      <div className="page-shell py-12 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link href="/" className="font-serif text-3xl">
            Pine Valley
          </Link>
          <p className="mt-1 text-sm">at Dillard Mill</p>
          <address className="mt-5 not-italic text-sm leading-7">
            126 Dillard Mill Road
            <br />
            Davisville, Missouri 65456
            <br />
            <a className="text-link" href="tel:+13148434321">
              (314) 843-4321
            </a>
            <br />
            <a className="text-link" href="mailto:pinevalley@dillardmill.com">
              pinevalley@dillardmill.com
            </a>
          </address>
        </div>
        <nav
          aria-label="Explore Pine Valley"
          className="grid content-start gap-3 text-sm"
        >
          <Link href="/lodging">Find a stay</Link>
          <Link href="/book-the-farm">Book the Farm</Link>
          <Link href="/photos">Photographs</Link>
          <Link href="/map">Property map & directions</Link>
          <Link href="/reviews">Guest reviews</Link>
        </nav>
        <nav
          aria-label="Around Pine Valley"
          className="grid content-start gap-3 text-sm"
        >
          <Link href="/dillardmill">Dillard Mill</Link>
          <Link href="/the-area/floating-outfitters">Floating & shuttles</Link>
          <Link href="/trails">Walks & hiking</Link>
          <Link href="/thoughts">From Pine Valley</Link>
          <a
            href="https://instagram.com/pinevalleydm"
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>
          <a
            href="https://www.facebook.com/pinevalleydm"
            target="_blank"
            rel="noreferrer"
          >
            Facebook ↗
          </a>
        </nav>
      </div>
      <div className="page-shell border-t border-brand-sand py-5 text-xs text-brand-stone">
        © {new Date().getFullYear()} Pine Valley at Dillard Mill
      </div>
    </footer>
  );
}
