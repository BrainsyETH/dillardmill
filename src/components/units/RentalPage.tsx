import { notFound } from "next/navigation";
import { getUnitBySlug } from "@/lib/stays/queries";
import { getBookingSettings } from "@/lib/booking/units";
import { UnitDetail } from "./UnitDetail";
import {
  generateVacationRentalSchema,
  generateJsonLdScript,
} from "@/lib/schema";
export async function RentalPage({ slug }: { slug: string }) {
  const unit = await getUnitBySlug(slug);
  if (!unit?.available) notFound();
  const settings =
    unit.directBookingEnabled !== false
      ? await getBookingSettings().catch(() => null)
      : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLdScript(
          generateVacationRentalSchema(unit),
        )}
      />
      <UnitDetail
        unit={unit}
        responseHours={settings?.requestResponseHours ?? 24}
      />
    </>
  );
}
