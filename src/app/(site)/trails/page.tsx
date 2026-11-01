import Link from "next/link";
import { PlaceStory } from "@/components/editorial/PlaceStory";
export const metadata = { title: "Walks and trails | Pine Valley" };
export default function Trails() {
  return (
    <PlaceStory
      eyebrow="On foot"
      title="Take a walk."
      intro="Start with the paths around Pine Valley. For a longer day out, explore the trails around Council Bluff Lake and the Bell Mountain Wilderness."
      image="c5542daf2b34"
    >
      <section>
        <h2 className="text-3xl mb-5">From your door</h2>
        <p>
          There are about 1½ to 2 miles of walking trails on the property, plus
          the roughly half-mile route to our private creek access. Your hosts
          can point you in the right direction.
        </p>
        <p>
          Dillard Mill is another walk from Pine Valley, with grounds and a
          historic mill to explore.
        </p>
        <Link href="/map" className="text-link">
          Property map ↗
        </Link>
      </section>
      <section>
        <h2 className="text-3xl mb-5">A longer trail day</h2>
        <h3 className="text-xl mt-6">Council Bluff Lake</h3>
        <p>
          A roughly 12-mile trail circles the lake. You can plan a shorter
          out-and-back instead of committing to the full loop.
        </p>
        <a
          href="https://www.recreation.gov/camping/campgrounds/232325"
          className="text-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Council Bluff visitor information ↗
        </a>
        <h3 className="text-xl mt-7">Bell Mountain Wilderness</h3>
        <p>
          For a more demanding hike, use the Forest Service trail map to choose
          a route that suits your group. Download your map before you leave.
        </p>
        <a
          href="https://www.fs.usda.gov/sites/nfs/files/r09/marktwain/publication/Mark%20Twain%20National%20Forest%20Trail%20Text%20-%20Bell%20Mountain%20Wilderness%20Area%202022.pdf"
          className="text-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Forest Service trail map (PDF) ↗
        </a>
      </section>
    </PlaceStory>
  );
}
