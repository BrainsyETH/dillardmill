import { NextRequest } from "next/server";
import { handleEventInquiry } from "@/lib/events/inquiry-handler";
export const dynamic = "force-dynamic";
export function POST(request: NextRequest) {
  return handleEventInquiry(request);
}
