import { notFound } from "next/navigation";
import { eventsPublished } from "@/lib/events/config";
import { EventPage } from "@/components/events/EventPage";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Weddings | Pine Valley at Dillard Mill",
  description:
    "Wedding weekends at Pine Valley. Eight accommodations, private creek access and room for up to 100 event guests.",
};
export default function Weddings() {
  if (!eventsPublished()) notFound();
  return <EventPage />;
}
