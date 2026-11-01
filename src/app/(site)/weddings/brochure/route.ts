import { eventsPublished } from "@/lib/events/config";
import { weddingBrochure } from "@/lib/events/brochure";
export const dynamic = "force-dynamic";
export function GET() {
  return eventsPublished()
    ? weddingBrochure()
    : new Response("Not found", { status: 404 });
}
