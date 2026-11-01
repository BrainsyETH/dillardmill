import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require";
import { EventInquiryForm } from "@/components/events/EventInquiryForm";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "New event | Pine Valley",
  robots: { index: false },
};
export default async function NewEvent() {
  await requireAdmin();
  return (
    <main className="page-shell py-10">
      <Link href="/admin/events" className="text-link">
        ← Events
      </Link>
      <h1 className="page-title mt-7 mb-8">New event</h1>
      <div className="max-w-2xl">
        <EventInquiryForm mode="admin" />
      </div>
    </main>
  );
}
