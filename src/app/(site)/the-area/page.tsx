import Link from "next/link";
import { PlaceStory } from "@/components/editorial/PlaceStory";
export const metadata = { title: "Nearby | Pine Valley at Dillard Mill" };
export default function Nearby() {
  return (
    <PlaceStory
      eyebrow="Out and about"
      title="A little farther afield."
      intro="A day on the river, a walk through the woods, or a visit to Dillard Mill. Leave some room in the weekend for the Ozarks."
      image="f093e998a91a"
    >
      <section>
        <p className="eyebrow">01 / By the water</p>
        <h2 className="text-3xl mb-5">Plan a float.</h2>
        <p>
          Choose an outfitter for your river, route, and group. Check water
          conditions and confirm the trip with the outfitter before leaving Pine
          Valley.
        </p>
        <Link href="/the-area/floating-outfitters" className="text-link">
          River outfitters and conditions ↗
        </Link>
      </section>
      <section>
        <p className="eyebrow">02 / On foot</p>
        <h2 className="text-3xl mb-5">Walk the woods.</h2>
        <p>
          Take a short walk on the property or plan a full trail day at Council
          Bluff Lake or Bell Mountain.
        </p>
        <Link href="/trails" className="text-link">
          Walks and trail information ↗
        </Link>
      </section>
      <section>
        <p className="eyebrow">03 / Down the road</p>
        <h2 className="text-3xl mb-5">Meet the mill.</h2>
        <p>
          Our neighboring historic site preserves a water-powered gristmill on
          Huzzah Creek. Check current tour hours before your visit.
        </p>
        <Link href="/dillardmill" className="text-link">
          Dillard Mill ↗
        </Link>
      </section>
      <section>
        <p className="eyebrow">04 / Ask a local</p>
        <h2 className="text-3xl mb-5">Make it your weekend.</h2>
        <p>
          Tell your hosts what you enjoy and how far you want to go. We can help
          you plan around the season and the people coming with you.
        </p>
        <Link href="/contact" className="text-link">
          Ask us ↗
        </Link>
      </section>
    </PlaceStory>
  );
}
