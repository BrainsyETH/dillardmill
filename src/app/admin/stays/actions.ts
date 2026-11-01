"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require";
import { parseSeasonForm, parseUnitForm } from "@/lib/stays/admin-input";
import {
  addSeason,
  createUnit,
  deleteSeason,
  getUnitById,
  updateUnit,
} from "@/lib/stays/repository";

async function friendlyDbError(error: unknown): Promise<string> {
  const e = error as { code?: string; message?: string };
  const message = e?.message ?? "";
  if (e?.code === "23505" || /duplicate key|unique/i.test(message)) {
    return /whole_property/.test(message)
      ? "Only one stay can be the whole property."
      : "Another stay already uses that web address.";
  }
  if (e?.code === "23514" || /check constraint/i.test(message)) {
    return "Some values are out of range. Check prices, guest counts and dates.";
  }
  console.error("Admin save failed", error);
  return "Could not save. Try again.";
}

function back(path: string, params: Record<string, string>): never {
  redirect(`${path}?${new URLSearchParams(params)}`);
}

/** Public pages are static; refresh them after property data changes. */
function refreshSite() {
  revalidatePath("/", "layout");
}

const stayPath = (id: string) => `/admin/stays/${encodeURIComponent(id)}`;

export async function createStayAction(form: FormData) {
  await requireAdmin();
  // New stays start hidden, with online requests off.
  form.delete("listed");
  form.delete("directBookingEnabled");
  form.delete("isWholeProperty");
  if (!form.get("sortOrder")) form.set("sortOrder", "100");
  if (!form.get("minStay")) form.set("minStay", "1");
  const parsed = parseUnitForm(form);
  if (!parsed.ok) back("/admin/stays", { error: parsed.error });
  let id: string;
  try {
    id = await createUnit(parsed.value);
  } catch (error) {
    back("/admin/stays", { error: await friendlyDbError(error) });
  }
  redirect(`${stayPath(id)}?created=1`);
}

export async function saveStayAction(id: string, form: FormData) {
  await requireAdmin();
  const existing = await getUnitById(id);
  if (!existing) back("/admin/stays", { error: "That stay no longer exists." });
  // The web address is fixed once a stay exists: photos, copy and page routes key off it.
  form.set("slug", existing.slug);
  const parsed = parseUnitForm(form);
  if (!parsed.ok) back(stayPath(id), { error: parsed.error });
  try {
    await updateUnit(id, parsed.value);
  } catch (error) {
    back(stayPath(id), { error: await friendlyDbError(error) });
  }
  refreshSite();
  back(stayPath(id), { saved: "1" });
}

export async function addSeasonAction(unitId: string, form: FormData) {
  await requireAdmin();
  const parsed = parseSeasonForm(form);
  if (!parsed.ok) back(stayPath(unitId), { error: parsed.error });
  try {
    await addSeason(unitId, parsed.value);
  } catch (error) {
    back(stayPath(unitId), { error: await friendlyDbError(error) });
  }
  refreshSite();
  back(stayPath(unitId), { saved: "1" });
}

export async function deleteSeasonAction(unitId: string, seasonId: string) {
  await requireAdmin();
  await deleteSeason(unitId, seasonId);
  refreshSite();
  back(stayPath(unitId), { saved: "1" });
}
