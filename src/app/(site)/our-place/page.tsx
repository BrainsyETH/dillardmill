import Link from "next/link";
import { PlaceStory } from "@/components/editorial/PlaceStory";
export const metadata = { title: "Our place | Pine Valley at Dillard Mill" };
export default function OurPlace() {
  return (
    <PlaceStory
      eyebrow="Around Pine Valley"
      title="Room to wander."
      intro="Trailers tucked among the trees. Ponds, paths, and the courtyard. A creek to spend an afternoon beside, and a red mill just down the road."
      image="2bb68e46fdd0"
    >
      <section>
        <h2 className="text-3xl mb-5">Make a day of doing very little.</h2>
        <p>
          Our grounds have about 1½ to 2 miles of walking trails and two ponds.
          Across from the entrance, a roughly half-mile path leads to our
          private access on Huzzah Creek.
        </p>
        <p>
          Ask us about the route and current conditions before heading down.
          There’s also the walk to neighboring Dillard Mill State Historic Site.
        </p>
        <Link href="/map" className="text-link">
          See the property map ↗
        </Link>
      </section>
      <section>
        <h2 className="text-3xl mb-5">Your own stay. Shared places.</h2>
        <p>
          The cottage and trailers have different sleeping and bathroom
          arrangements. Some have outdoor tubs; some of the Farm’s
          accommodations share the bathhouse. Each stay’s page explains the
          essentials.
        </p>
        <p>
          For a reunion or celebration, the whole Farm brings the accommodations
          and gathering spaces together in one reservation.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link href="/lodging" className="text-link">
            Choose a stay ↗
          </Link>
          <Link href="/book-the-farm" className="text-link">
            Book the Farm ↗
          </Link>
        </div>
      </section>
    </PlaceStory>
  );
}
