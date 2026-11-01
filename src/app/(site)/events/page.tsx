import { notFound } from "next/navigation";
import { eventsPublished } from "@/lib/events/config";
import { EventPage } from "@/components/events/EventPage";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private events | Pine Valley at Dillard Mill",
  description:
    "Plan a family reunion, retreat or private celebration at Pine Valley.",
};
export default function Events() {
  if (!eventsPublished()) notFound();
  return <EventPage wedding={false} />;
}
