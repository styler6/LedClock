import { z } from "zod";

/** Shared zod schemas used by both the web form layer (react-hook-form) and server actions. */

export const customerInputSchema = z.object({
  type: z.enum(["private", "business"]),
  name: z.string().min(1, "Name ist erforderlich"),
  contactPerson: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().or(z.literal("")),
  phone: z.string().optional(),
  addressStreet: z.string().optional(),
  addressZip: z.string().optional(),
  addressCity: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;

export const lineItemInputSchema = z.object({
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  quantity: z.number().positive("Menge muss größer als 0 sein"),
  unit: z.string().min(1),
  unitPrice: z.number().nonnegative("Preis darf nicht negativ sein"),
  taxRate: z.number().min(0).max(100),
});

export type LineItemInput = z.infer<typeof lineItemInputSchema>;

export const quoteInputSchema = z.object({
  customerId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lineItems: z.array(lineItemInputSchema).min(1, "Mindestens eine Position ist erforderlich"),
});

export type QuoteInput = z.infer<typeof quoteInputSchema>;

export const equipmentBookingInputSchema = z
  .object({
    equipmentId: z.string().uuid(),
    bookingType: z.enum(["customer_rental", "internal_project"]),
    customerId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional(),
    startAt: z.string(),
    endAt: z.string(),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: "Enddatum muss nach dem Startdatum liegen",
    path: ["endAt"],
  })
  .refine((data) => (data.bookingType === "customer_rental" ? !!data.customerId : !!data.projectId), {
    message: "Kunde bzw. Projekt ist für diesen Buchungstyp erforderlich",
    path: ["bookingType"],
  });

export type EquipmentBookingInput = z.infer<typeof equipmentBookingInputSchema>;
