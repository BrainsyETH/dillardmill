import Link from "next/link";
import { AdminShell, Field } from "@/components/admin/AdminShell";
import { listUnits } from "@/lib/stays/repository";
import { formatCents } from "@/lib/booking/pricing";
import { createStayAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stays | Admin", robots: { index: false } };

export default async function StaysPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, units] = await Promise.all([searchParams, listUnits()]);
  return (
    <AdminShell
      title="Stays & pricing"
      intro="Prices, fees, guest limits and online booking for each stay. Changes show on the website within a minute."
      error={error}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-sm text-brand-stone">
            <tr>
              <th className="py-2 pr-4">Stay</th>
              <th className="py-2 pr-4">Nightly</th>
              <th className="py-2 pr-4">Guests</th>
              <th className="py-2 pr-4">On website</th>
              <th className="py-2 pr-4">Online requests</th>
              <th className="py-2 pr-4">Airbnb import</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-sand">
            {units.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-4">
                  <Link
                    className="text-link"
                    href={`/admin/stays/${encodeURIComponent(u.id)}`}
                  >
                    {u.name}
                  </Link>
                  {u.isWholeProperty && (
                    <span className="ml-2 text-xs text-brand-stone">
                      whole property
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {u.basePriceCents ? formatCents(u.basePriceCents) : "—"}
                  {u.seasons.length ? (
                    <span className="text-xs text-brand-stone">
                      {" "}
                      + {u.seasons.length} seasons
                    </span>
                  ) : null}
                </td>
                <td className="py-3 pr-4">{u.maxGuests}</td>
                <td className="py-3 pr-4">{u.listed ? "Shown" : "Hidden"}</td>
                <td className="py-3 pr-4">
                  {u.directBookingEnabled ? "On" : "Off"}
                </td>
                <td className="py-3 pr-4">
                  {u.airbnbIcalUrl ? "Connected" : "Manual"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mt-10 border-t border-brand-sand pt-6">
        <summary className="cursor-pointer section-title text-2xl">
          Add a stay
        </summary>
        <p className="mt-3 text-sm text-brand-stone max-w-2xl">
          New stays start hidden with online requests off. Their photos and full
          description are added to the website content files.
        </p>
        <form
          action={createStayAction}
          className="mt-5 grid gap-5 sm:grid-cols-3 items-end"
        >
          <Field label="Name" name="name" required maxLength={120} />
          <Field
            label="Web address"
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            hint="e.g. tiny-cabin — cannot be changed later"
          />
          <Field
            label="Maximum guests"
            name="maxGuests"
            type="number"
            min={1}
            max={500}
            required
          />
          <button className="btn btn-primary sm:col-span-3 justify-self-start">
            Create stay
          </button>
        </form>
      </details>
    </AdminShell>
  );
}
