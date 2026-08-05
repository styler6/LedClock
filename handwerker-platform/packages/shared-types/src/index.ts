export * from "./database.types";
export * from "./enums";

import type { Database } from "./database.types";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type QuoteLineItem = Database["public"]["Tables"]["quote_line_items"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceLineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectAssignment = Database["public"]["Tables"]["project_assignments"]["Row"];
export type ProjectStatusHistoryEntry = Database["public"]["Tables"]["project_status_history"]["Row"];
export type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
export type EquipmentBooking = Database["public"]["Tables"]["equipment_bookings"]["Row"];
