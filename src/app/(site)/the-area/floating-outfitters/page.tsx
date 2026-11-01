import Link from "next/link";
import FloatingOutfitters from "@/components/area/FloatingOutfitters";
export const metadata = {
  title: "River outfitters | Pine Valley",
  description:
    "Find canoe, kayak, raft, and tube outfitters for a day on the river near Pine Valley.",
};
export default function Page() {
  return (
    <div className="page-shell section-space">
      <Link href="/the-area" className="text-link">
        ← Nearby
      </Link>
      <p className="eyebrow mt-9 mb-4">Plan a day on the river</p>
      <h1 className="page-title mb-6">Choose your float.</h1>
      <p className="text-lg leading-relaxed max-w-2xl mb-8">
        Find an outfitter, choose a route, and check current conditions. Drive
        times are approximate; confirm availability and your trip with the
        outfitter before setting out.
      </p>
      <div className="border-y border-brand-sand py-4 mb-10 text-sm">
        River readings are provided by{" "}
        <a
          href="https://eddy.guide"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eddy
        </a>
        . A reading is a snapshot, not a guarantee of safe conditions.
      </div>
      <FloatingOutfitters />
    </div>
  );
}
