import { NextRequest } from "next/server";
import { handleEventInquiry } from "@/lib/events/inquiry-handler";
export function POST(request: NextRequest) {
  return handleEventInquiry(request, true);
}
