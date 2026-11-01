import Link from "next/link";
import { PlaceStory } from "@/components/editorial/PlaceStory";
export const metadata = { title: "Dillard Mill | Pine Valley" };
export default function DillardMill() {
  return (
    <PlaceStory
      eyebrow="Our neighbor"
      title="Dillard Mill."
      intro="The red mill on Huzzah Creek is a good reason to take a walk. Pine Valley neighbors Dillard Mill State Historic Site."
      image="6d2bebefce59"
    >
      <section>
        <h2 className="text-3xl mb-5">A working piece of history.</h2>
        <p>
          The restored, water-powered gristmill retains much of its original
          machinery. A visit gives you a closer look at how the mill worked and
          the community that grew around it.
        </p>
        <p>
          The historic site is managed by Missouri State Parks, separately from
          Pine Valley.
        </p>
      </section>
      <section>
        <h2 className="text-3xl mb-5">Plan your visit.</h2>
        <p>
          Tour times, access, and opening hours can change with the season.
          Check the park’s current information before setting out.
        </p>
        <a
          href="https://mostateparks.com/historic-site/dillard-mill-state-historic-site"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          Hours, tours, and park information ↗
        </a>
        <p className="mt-6">
          <Link href="/map" className="text-link">
            Find Pine Valley and the mill ↗
          </Link>
        </p>
      </section>
    </PlaceStory>
  );
}
