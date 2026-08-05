/** German display labels + Tailwind color classes for every status enum, shared across all web pages. */

export const QUOTE_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Entwurf", className: "bg-gray-100 text-gray-700" },
  sent: { label: "Versendet", className: "bg-blue-100 text-blue-700" },
  accepted: { label: "Angenommen", className: "bg-green-100 text-green-700" },
  rejected: { label: "Abgelehnt", className: "bg-red-100 text-red-700" },
  expired: { label: "Abgelaufen", className: "bg-gray-100 text-gray-500" },
  converted: { label: "In Rechnung umgewandelt", className: "bg-purple-100 text-purple-700" },
};

export const INVOICE_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Entwurf", className: "bg-gray-100 text-gray-700" },
  sent: { label: "Versendet", className: "bg-blue-100 text-blue-700" },
  paid: { label: "Bezahlt", className: "bg-green-100 text-green-700" },
  overdue: { label: "Überfällig", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Storniert", className: "bg-gray-100 text-gray-500" },
};

export const PROJECT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  planned: { label: "Geplant", className: "bg-gray-100 text-gray-700" },
  in_progress: { label: "In Bearbeitung", className: "bg-blue-100 text-blue-700" },
  on_hold: { label: "Pausiert", className: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Abgeschlossen", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Storniert", className: "bg-red-100 text-red-700" },
};

export const BOOKING_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  reserved: { label: "Reserviert", className: "bg-gray-100 text-gray-700" },
  checked_out: { label: "Ausgegeben", className: "bg-blue-100 text-blue-700" },
  returned: { label: "Zurückgegeben", className: "bg-green-100 text-green-700" },
  overdue: { label: "Überfällig", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Storniert", className: "bg-gray-100 text-gray-500" },
};
