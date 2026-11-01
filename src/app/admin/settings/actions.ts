"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require";
import { parseSettingsForm, parseTaxForm } from "@/lib/stays/admin-input";
import { addTax, deleteTax, saveSettings } from "@/lib/stays/repository";

function back(params: Record<string, string>): never {
  redirect(`/admin/settings?${new URLSearchParams(params)}`);
}

export async function saveSettingsAction(form: FormData) {
  await requireAdmin();
  const parsed = parseSettingsForm(form);
  if (!parsed.ok) back({ error: parsed.error });
  await saveSettings(parsed.value);
  revalidatePath("/", "layout");
  back({ saved: "1" });
}

export async function addTaxAction(form: FormData) {
  await requireAdmin();
  const parsed = parseTaxForm(form);
  if (!parsed.ok) back({ error: parsed.error });
  await addTax(parsed.value.name, parsed.value.ratePercent);
  back({ saved: "1" });
}

export async function deleteTaxAction(id: string) {
  await requireAdmin();
  await deleteTax(id);
  back({ saved: "1" });
}
