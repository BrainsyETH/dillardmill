import { z } from "zod";
import { isIsoDate, todayAtProperty } from "@/lib/booking/dates";
import { EVENT_CAPACITY, OVERNIGHT_CAPACITY } from "./content";
const futureDate = z
  .string()
  .refine(
    (v) => isIsoDate(v) && v >= todayAtProperty(),
    "Choose today or a future date.",
  );
export const eventInquirySchema = z
  .object({
    submissionId: z.string().uuid(),
    name: z.string().trim().min(2, "Please enter your name.").max(120),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email.")
      .max(200),
    phone: z.string().trim().max(40).optional(),
    eventType: z.enum([
      "wedding",
      "reunion",
      "retreat",
      "celebration",
      "other",
    ]),
    eventDate: futureDate.optional(),
    dateFlexibility: z.string().trim().max(120).optional(),
    guests: z
      .number()
      .int()
      .min(1)
      .max(EVENT_CAPACITY, "Events can have up to 100 guests."),
    overnightGuests: z
      .number()
      .int()
      .min(0)
      .max(
        OVERNIGHT_CAPACITY,
        "Up to 50 guests can stay overnight, including camping.",
      )
      .optional(),
    packageId: z
      .enum(["riverside-escape", "ozarks-micro-wedding", "farm-long-weekend"])
      .optional(),
    budget: z.string().trim().max(100).optional(),
    referralSource: z.string().trim().max(100).optional(),
    message: z.string().trim().max(4000).default(""),
    website: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.eventDate && !v.dateFlexibility)
      ctx.addIssue({
        code: "custom",
        path: ["eventDate"],
        message: "Choose a date or tell us when you have in mind.",
      });
    if ((v.overnightGuests ?? 0) > v.guests)
      ctx.addIssue({
        code: "custom",
        path: ["overnightGuests"],
        message: "Overnight guests cannot exceed the total guest count.",
      });
  });
export type EventInquiry = z.infer<typeof eventInquirySchema>;
export const holdSchema = z
  .object({
    action: z.literal("hold"),
    start: futureDate,
    end: futureDate,
    expiresOn: futureDate,
    calendarsChecked: z.literal(true, {
      error: "Check all external listings before holding dates.",
    }),
  })
  .refine((v) => v.end > v.start, {
    message: "Departure must be after arrival.",
  });
export const eventActionSchema = z.discriminatedUnion("action", [
  holdSchema,
  z.object({
    action: z.literal("extend"),
    reservationId: z.string().uuid(),
    expiresOn: futureDate,
  }),
  z.object({
    action: z.literal("confirm"),
    reservationId: z.string().uuid(),
    externalBlockKeys: z.array(z.string().max(500)).max(500).default([]),
    agreementConfirmed: z.literal(true, {
      error: "Confirm that the contract and payment have been arranged.",
    }),
    calendarsChecked: z.literal(true, {
      error: "Check all external listings before confirming.",
    }),
  }),
  z.object({ action: z.literal("release"), reservationId: z.string().uuid() }),
  z.object({
    action: z.literal("update"),
    stage: z.enum(["new", "replied", "tour", "closed"]),
    assignedTo: z.string().trim().max(120),
    followUpOn: z.string().refine((v) => !v || isIsoDate(v)),
    notes: z.string().trim().max(8000),
  }),
]);
export type EventAction = z.infer<typeof eventActionSchema>;
