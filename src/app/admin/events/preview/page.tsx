import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { requireAdmin } from "@/lib/admin/require";
import { EventPage } from "@/components/events/EventPage";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Wedding preview | Pine Valley",
  robots: { index: false, follow: false },
};
export default async function Preview({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdmin();
  const { type } = await searchParams;
  return (
    <>
      <div className="bg-brand-forest text-white px-6 py-3 text-sm flex flex-wrap justify-between gap-3">
        <span>Private preview · inquiries are disabled here</span>
        <Link className="underline" href="/admin/events">
          Back to events
        </Link>
      </div>
      <Header />
      <main id="main-content">
        <EventPage wedding={type !== "events"} preview />
      </main>
      <Footer />
    </>
  );
}
