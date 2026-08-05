export const ROLES = ["owner", "admin", "employee"] as const;
export type Role = (typeof ROLES)[number];

export const CUSTOMER_TYPES = ["private", "business"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const QUOTE_STATUSES = ["draft", "sent", "accepted", "rejected", "expired", "converted"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PROJECT_STATUSES = ["planned", "in_progress", "on_hold", "completed", "cancelled"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const EQUIPMENT_STATUSES = ["available", "booked", "in_use", "maintenance", "retired"] as const;
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export const BOOKING_TYPES = ["customer_rental", "internal_project"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export const BOOKING_STATUSES = ["reserved", "checked_out", "returned", "overdue", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
