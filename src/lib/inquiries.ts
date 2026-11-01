import { z } from "zod";
import { sql } from "@/lib/db/client";
import { isIsoDate, todayAtProperty } from "@/lib/booking/dates";
import { sendGuestMessageNotification } from "@/lib/email/resend";

export const messageSchema = z
  .object({
    submissionId: z.string().uuid(),
    kind: z.enum(["contact", "inquiry"]),
    name: z.string().trim().min(2, "Please enter your name.").max(120),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email.")
      .max(200),
    phone: z.string().trim().max(40).optional(),
    unitSlug: z
      .string()
      .regex(/^[a-z0-9-]*$/)
      .max(100)
      .optional(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    guests: z.number().int().min(1).max(100).optional(),
    message: z.string().trim().min(5, "Please add a short message.").max(4000),
    website: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.checkIn || v.checkOut) {
      if (
        !isIsoDate(v.checkIn) ||
        !isIsoDate(v.checkOut) ||
        v.checkOut <= v.checkIn ||
        v.checkIn < todayAtProperty()
      ) {
        ctx.addIssue({
          code: "custom",
          message:
            "Choose future check-in and check-out dates, or leave both blank.",
          path: ["checkIn"],
        });
      }
    }
    if (v.kind === "inquiry" && !v.guests)
      ctx.addIssue({
        code: "custom",
        message: "Please enter your group size.",
        path: ["guests"],
      });
  });
export type GuestMessageInput = z.infer<typeof messageSchema>;

export async function receiveGuestMessage(input: GuestMessageInput) {
  const existing =
    await sql`SELECT id FROM guest_messages WHERE submission_id = ${input.submissionId}`;
  if (existing.length) return { ok: true as const };
  const recent =
    await sql`SELECT count(*)::int AS count FROM guest_messages WHERE email = ${input.email} AND created_at > now() - interval '1 hour'`;
  if (Number(recent[0]?.count) >= 5)
    return {
      ok: false as const,
      status: 429,
      error:
        "We have your recent messages. Please call us if you need anything else right away.",
    };
  const inserted = await sql`
    INSERT INTO guest_messages (submission_id, kind, name, email, phone, unit_slug, check_in, check_out, guests, message)
    VALUES (${input.submissionId}, ${input.kind}, ${input.name}, ${input.email}, ${input.phone || null},
      ${input.unitSlug || null}, ${input.checkIn || null}, ${input.checkOut || null}, ${input.guests ?? null}, ${input.message})
    ON CONFLICT (submission_id) DO NOTHING RETURNING id
  `;
  if (inserted.length) {
    const notified = await sendGuestMessageNotification(input);
    await sql`UPDATE guest_messages SET owner_notified = ${notified} WHERE id = ${inserted[0].id}`;
  }
  return { ok: true as const };
}
