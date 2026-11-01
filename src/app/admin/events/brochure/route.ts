import { requireAdmin } from "@/lib/admin/require";
import { weddingBrochure } from "@/lib/events/brochure";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
  return weddingBrochure();
}
