import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  AdminShell,
  Check,
  Field,
  Section,
} from "@/components/admin/AdminShell";
import { getUnitById } from "@/lib/stays/repository";
import { centsToInput } from "@/lib/stays/admin-input";
import {
  addSeasonAction,
  deleteSeasonAction,
  saveStayAction,
  updateSeasonAction,
} from "../actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Edit stay | Admin",
  robots: { index: false },
};

/** Occasional settings, folded away so price and availability stay prominent. */
function Fold({
  title,
  open,
  children,
}: {
  title: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="border-t border-brand-sand pt-5 mt-8" open={open}>
      <summary className="cursor-pointer section-title text-2xl">
        {title}
      </summary>
      <div className="grid gap-5 sm:grid-cols-2 mt-4">{children}</div>
    </details>
  );
}

export default async function EditStay({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  const [{ id }, q] = await Promise.all([params, searchParams]);
  const unit = await getUnitById(decodeURIComponent(id));
  if (!unit) notFound();

  const save = saveStayAction.bind(null, unit.id);
  const addSeason = addSeasonAction.bind(null, unit.id);
  const anyCalendar = Boolean(
    unit.airbnbIcalUrl || unit.hipcampIcalUrl || unit.vrboIcalUrl,
  );

  return (
    <AdminShell
      title={unit.name}
      back={{ href: "/admin/stays", label: "Stays & pricing" }}
      intro={
        <>
          Amounts are in US dollars before tax; taxes are set in{" "}
          <a className="text-link" href="/admin/settings">
            Booking settings
          </a>
          .
        </>
      }
      error={q.error}
      notice={
        q.created
          ? "Stay created. Set its price, then show it on the website."
          : q.saved
            ? "Saved."
            : null
      }
    >
      <form action={save}>
        <input type="hidden" name="slug" value={unit.slug} />

        <Section title="Price & availability">
          <Field
            label="Nightly price"
            name="basePriceCents"
            prefix="$"
            inputMode="decimal"
            defaultValue={centsToInput(unit.basePriceCents)}
            hint="Used when no season applies"
          />
          <Field
            label="Cleaning fee"
            name="cleaningFeeCents"
            prefix="$"
            inputMode="decimal"
            defaultValue={centsToInput(unit.cleaningFeeCents)}
            hint="Once per stay"
          />
          <Field
            label="Minimum nights"
            name="minStay"
            type="number"
            min={1}
            max={60}
            defaultValue={unit.minStay}
            required
          />
          <div />
          <Check
            label="Show on website"
            name="listed"
            defaultChecked={unit.listed}
          />
          <Check
            label="Accept booking requests online"
            name="directBookingEnabled"
            defaultChecked={unit.directBookingEnabled}
            hint="Guests request dates and authorize a card; you approve each one. Needs a nightly price. When off, the stay page shows an inquiry form."
          />
        </Section>

        <Section title="Guests & pets">
          <Field
            label="Maximum guests"
            name="maxGuests"
            type="number"
            min={1}
            max={500}
            defaultValue={unit.maxGuests}
            required
          />
          <Field
            label="Guests included in price"
            name="baseGuests"
            type="number"
            min={1}
            max={500}
            defaultValue={unit.baseGuests}
            hint="Blank = everyone included"
          />
          <Field
            label="Extra guest fee"
            name="extraGuestFeeCents"
            prefix="$"
            inputMode="decimal"
            defaultValue={centsToInput(unit.extraGuestFeeCents)}
            hint="Per guest, per night, above the included number"
          />
          <div />
          <Check
            label="Pets allowed"
            name="petsAllowed"
            defaultChecked={unit.petsAllowed}
          />
          <div />
          <Field
            label="Maximum pets"
            name="maxPets"
            type="number"
            min={0}
            max={20}
            defaultValue={unit.maxPets}
          />
          <Field
            label="Pet fee"
            name="petFeeCents"
            prefix="$"
            inputMode="decimal"
            defaultValue={centsToInput(unit.petFeeCents)}
            hint="Per pet, once per stay"
          />
        </Section>

        <button className="btn btn-primary mt-8">Save {unit.name}</button>

        <Fold title="Name, description & order">
          <Field
            label="Name"
            name="name"
            defaultValue={unit.name}
            required
            maxLength={120}
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={unit.sortOrder}
            hint="Lower numbers appear first"
          />
          <label className="block sm:col-span-2">
            <span className="field-label">Short description (optional)</span>
            <textarea
              className="field"
              name="shortDescription"
              rows={3}
              maxLength={600}
              defaultValue={unit.shortDescription ?? ""}
              placeholder="Leave blank to use the description from the website content"
            />
          </label>
          <p className="sm:col-span-2 text-sm text-brand-stone">
            Web address: <code>{unit.slug}</code> (fixed — photos and the page
            are keyed to it).
          </p>
        </Fold>

        <Fold title="Whole property">
          <div className="sm:col-span-2">
            <Check
              label="This stay is the whole property"
              name="isWholeProperty"
              defaultChecked={unit.isWholeProperty}
              hint="Booking it blocks every other stay, and any other booking blocks it (the Farm). Existing bookings are re-checked when you change this; the save is refused if they would overlap."
            />
          </div>
        </Fold>

        <Fold title="Other platforms" open={anyCalendar}>
          <p className="sm:col-span-2 text-sm text-brand-stone">
            <strong>Calendar links are optional.</strong> Paste a
            platform&apos;s <em>export</em> calendar link and the website
            imports its bookings, so guests can&apos;t request dates already
            taken there. Leave blank to manage that platform by hand.
          </p>
          <Field
            label="Airbnb calendar link"
            name="airbnbIcalUrl"
            type="url"
            defaultValue={unit.airbnbIcalUrl}
            placeholder="https://www.airbnb.com/calendar/ical/…"
          />
          <Field
            label="Hipcamp calendar link"
            name="hipcampIcalUrl"
            type="url"
            defaultValue={unit.hipcampIcalUrl}
          />
          <Field
            label="VRBO calendar link"
            name="vrboIcalUrl"
            type="url"
            defaultValue={unit.vrboIcalUrl}
          />
          <div className="sm:col-span-2">
            <Check
              label="If I remove a calendar link, keep its upcoming dates as blocks"
              name="keepDisconnectedAsBlocks"
              defaultChecked
              hint="Otherwise those dates reopen for website requests immediately."
            />
          </div>
          <Field
            label="Airbnb listing page"
            name="airbnbUrl"
            type="url"
            defaultValue={unit.airbnbUrl}
          />
          <Field
            label="Hipcamp listing page"
            name="hipcampUrl"
            type="url"
            defaultValue={unit.hipcampUrl}
          />
          <Field
            label="VRBO listing page"
            name="vrboUrl"
            type="url"
            defaultValue={unit.vrboUrl}
          />
        </Fold>
      </form>

      <section className="border-t border-brand-sand pt-6 mt-12">
        <h2 className="section-title text-2xl">Seasonal prices</h2>
        <p className="text-sm text-brand-stone mt-2 max-w-2xl">
          A season replaces the nightly price for every night from its first to
          its last date (inclusive). Where seasons overlap, the one that starts
          later wins — so a holiday weekend can sit inside a longer season.
        </p>
        {unit.seasons.length > 0 && (
          <div className="mt-4 divide-y divide-brand-sand">
            {unit.seasons.map((s) => (
              <div key={s.id} className="py-4">
                <form
                  action={updateSeasonAction.bind(null, unit.id, s.id)}
                  className="grid gap-4 sm:grid-cols-5 items-end"
                >
                  <Field
                    label="Season"
                    name="name"
                    defaultValue={s.name}
                    required
                    maxLength={80}
                  />
                  <Field
                    label="First night"
                    name="startDate"
                    type="date"
                    defaultValue={s.startDate}
                    required
                  />
                  <Field
                    label="Last night"
                    name="endDate"
                    type="date"
                    defaultValue={s.endDate}
                    required
                  />
                  <Field
                    label="Nightly price"
                    name="price"
                    prefix="$"
                    inputMode="decimal"
                    defaultValue={centsToInput(s.priceCents)}
                    required
                  />
                  <span className="flex gap-4 items-center">
                    <button className="btn btn-outline">Save</button>
                    <button
                      formAction={deleteSeasonAction.bind(null, unit.id, s.id)}
                      formNoValidate
                      className="text-link text-sm"
                    >
                      Remove
                    </button>
                  </span>
                </form>
              </div>
            ))}
          </div>
        )}
        <form
          action={addSeason}
          className="mt-6 grid gap-4 sm:grid-cols-5 items-end"
        >
          <Field
            label="New season"
            name="name"
            required
            maxLength={80}
            placeholder="Fall color"
          />
          <Field label="First night" name="startDate" type="date" required />
          <Field label="Last night" name="endDate" type="date" required />
          <Field
            label="Nightly price"
            name="price"
            prefix="$"
            inputMode="decimal"
            required
          />
          <button className="btn btn-outline">Add season</button>
        </form>
      </section>
    </AdminShell>
  );
}
