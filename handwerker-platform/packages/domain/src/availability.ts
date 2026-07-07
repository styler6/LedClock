export interface BookingRange {
  startAt: string | Date;
  endAt: string | Date;
  status: string;
}

const ACTIVE_BOOKING_STATUSES = new Set(["reserved", "checked_out"]);

/**
 * Mirrors the `equipment_bookings_no_overlap` exclusion constraint
 * (supabase/migrations/20260101000500_equipment.sql) so the UI can reject an
 * overlapping booking with a clear message before hitting the DB constraint.
 */
export function rangesOverlap(a: { startAt: string | Date; endAt: string | Date }, b: { startAt: string | Date; endAt: string | Date }): boolean {
  const aStart = new Date(a.startAt).getTime();
  const aEnd = new Date(a.endAt).getTime();
  const bStart = new Date(b.startAt).getTime();
  const bEnd = new Date(b.endAt).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export function findConflictingBooking(
  candidate: { startAt: string | Date; endAt: string | Date },
  existingBookings: BookingRange[],
): BookingRange | undefined {
  return existingBookings.find(
    (booking) => ACTIVE_BOOKING_STATUSES.has(booking.status) && rangesOverlap(candidate, booking),
  );
}

export function isEquipmentAvailable(
  candidate: { startAt: string | Date; endAt: string | Date },
  existingBookings: BookingRange[],
): boolean {
  return findConflictingBooking(candidate, existingBookings) === undefined;
}
