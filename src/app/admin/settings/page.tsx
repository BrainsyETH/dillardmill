import { AdminShell, Field, Section } from "@/components/admin/AdminShell";
import { getSettings, listTaxes } from "@/lib/stays/repository";
import {
  addTaxAction,
  deleteTaxAction,
  saveSettingsAction,
  updateTaxAction,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings | Admin", robots: { index: false } };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const [q, settings, taxes] = await Promise.all([
    searchParams,
    getSettings(),
    listTaxes(),
  ]);
  return (
    <AdminShell
      title="Booking settings"
      intro="Taxes and policies apply to every online booking request. Guests must accept the policies before sending a request."
      error={q.error}
      notice={q.saved ? "Saved." : null}
    >
      <section>
        <h2 className="section-title text-2xl">Taxes collected</h2>
        <p className="text-sm text-brand-stone mt-2 max-w-2xl">
          Each tax is applied to the stay subtotal (nights, guest and pet fees,
          cleaning) and shown as its own line at checkout. Leave empty to
          collect no tax.
        </p>
        {taxes.length > 0 && (
          <div className="mt-4 divide-y divide-brand-sand max-w-3xl">
            {taxes.map((t) => (
              <form
                key={t.id}
                action={updateTaxAction.bind(null, t.id)}
                className="py-4 grid gap-4 sm:grid-cols-3 items-end"
              >
                <Field
                  label="Name shown to guests"
                  name="name"
                  defaultValue={t.name}
                  required
                  maxLength={80}
                />
                <Field
                  label="Rate (%)"
                  name="ratePercent"
                  inputMode="decimal"
                  defaultValue={String(t.ratePercent)}
                  required
                />
                <span className="flex gap-4 items-center">
                  <button className="btn btn-outline">Save</button>
                  <button
                    formAction={deleteTaxAction.bind(null, t.id)}
                    formNoValidate
                    className="text-link text-sm"
                  >
                    Remove
                  </button>
                </span>
              </form>
            ))}
          </div>
        )}
        <form
          action={addTaxAction}
          className="mt-5 grid gap-4 sm:grid-cols-3 items-end max-w-2xl"
        >
          <Field
            label="New tax"
            name="name"
            required
            maxLength={80}
            placeholder="Lodging tax"
          />
          <Field
            label="Rate (%)"
            name="ratePercent"
            inputMode="decimal"
            required
            placeholder="4.225"
          />
          <button className="btn btn-outline">Add tax</button>
        </form>
      </section>

      <form action={saveSettingsAction}>
        <Section title="Policies & times">
          <label className="block sm:col-span-2">
            <span className="field-label">Cancellation policy</span>
            <textarea
              className="field"
              name="cancellationPolicy"
              rows={5}
              maxLength={5000}
              defaultValue={settings.cancellationPolicy ?? ""}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">House rules</span>
            <textarea
              className="field"
              name="houseRules"
              rows={6}
              maxLength={5000}
              defaultValue={settings.houseRules ?? ""}
            />
          </label>
          <Field
            label="Check-in time"
            name="checkInTime"
            defaultValue={settings.checkInTime}
            placeholder="3:00 PM"
            maxLength={40}
          />
          <Field
            label="Check-out time"
            name="checkOutTime"
            defaultValue={settings.checkOutTime}
            placeholder="11:00 AM"
            maxLength={40}
          />
          <Field
            label="Hours to respond to a request"
            name="requestResponseHours"
            type="number"
            min={1}
            max={144}
            defaultValue={settings.requestResponseHours}
            required
            hint="Unanswered requests are declined automatically and the card hold released. Maximum 144 (card holds last 7 days)."
          />
        </Section>
        <button className="btn btn-primary mt-8">Save settings</button>
      </form>
    </AdminShell>
  );
}
