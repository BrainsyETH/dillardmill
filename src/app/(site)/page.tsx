import Image from "next/image";
import Link from "next/link";
import { getAllUnits } from "@/lib/sanity/queries";
import { UnitCard } from "@/components/units/UnitCard";
import { photo } from "@/lib/content/property";

export default async function Home() {
  const units = (await getAllUnits())
    .filter((u) => u.slug.current !== "book-the-farm")
    .slice(0, 3);
  const hero = photo("819922e5ba54");
  const creek = photo("bb46c51f3e11");
  const mill = photo("6d2bebefce59");
  return (
    <>
      <section className="page-shell pt-10 md:pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <div>
            <p className="eyebrow mb-4">Pine Valley · Davisville, Missouri</p>
            <h1 className="page-title">
              Come down to
              <br />
              Pine Valley.
            </h1>
          </div>
          <div className="max-w-sm md:pb-2">
            <p className="text-lg leading-relaxed mb-5">
              Vintage trailers, a cozy cottage, and room to gather. Come stay
              beside Dillard Mill, in the Missouri Ozarks.
            </p>
            <Link href="/lodging" className="text-link">
              Find your stay <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        <figure>
          <div className="relative aspect-[5/4] sm:aspect-[2.15/1]">
            <Image
              src={hero.src}
              alt="The Pine Valley courtyard at dusk, with string lights between the café and barn"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="flex justify-between gap-4 text-xs text-brand-stone py-3">
            <span>Evening in the courtyard</span>
            <Link href="/photos" className="underline underline-offset-4">
              See Pine Valley in photographs
            </Link>
          </figcaption>
        </figure>
      </section>
      <section className="page-shell section-space">
        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end mb-9">
          <div>
            <p className="eyebrow mb-3">Make yourself at home</p>
            <h2 className="section-title">Three ways to stay.</h2>
          </div>
          <Link href="/lodging" className="text-link">
            All stays ↗
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-x-7 gap-y-12">
          {units.map((u) => (
            <UnitCard key={u._id} unit={u} />
          ))}
        </div>
      </section>
      <section className="bg-brand-forest text-brand-cream">
        <div className="page-shell grid md:grid-cols-2 gap-10 lg:gap-20 items-center section-space">
          <div className="relative aspect-[4/3]">
            <Image
              src={creek.src}
              alt="Friends and their dog spending an afternoon at Pine Valley’s private creek access"
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-brand-sand mb-5">
              The whole place, together
            </p>
            <h2 className="section-title mb-6">
              Bring your people.
              <br />
              Book the Farm.
            </h2>
            <p className="leading-relaxed text-lg mb-7 max-w-md">
              Eight stays, a communal kitchen, and a courtyard for long
              evenings. For family reunions, celebrations, or simply a weekend
              with everyone in one place.
            </p>
            <Link href="/book-the-farm" className="text-link">
              Explore the Farm ↗
            </Link>
          </div>
        </div>
      </section>
      <section className="page-shell section-space grid md:grid-cols-[.9fr_1.1fr] gap-10 lg:gap-24 items-center">
        <div>
          <p className="eyebrow mb-4">Just beyond your door</p>
          <h2 className="section-title mb-6">Take the slow way.</h2>
          <p className="text-lg leading-relaxed mb-7">
            Walk over to Dillard Mill. Follow the trail down to Huzzah Creek. Or
            make another cup of coffee and stay put.
          </p>
          <div className="flex flex-wrap gap-7">
            <Link className="text-link" href="/our-place">
              Around Pine Valley ↗
            </Link>
            <Link className="text-link" href="/the-area">
              A little farther afield ↗
            </Link>
          </div>
        </div>
        <figure>
          <div className="relative aspect-[4/3]">
            <Image
              src={mill.src}
              alt={mill.alt}
              fill
              sizes="(max-width: 767px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <figcaption className="text-xs text-brand-stone pt-3">
            Dillard Mill, our neighbor
          </figcaption>
        </figure>
      </section>
    </>
  );
}
