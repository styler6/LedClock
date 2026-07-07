import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAllEquipmentBookings, getEquipmentCatalog } from "@handwerker/api-client";
import { StatusBadge, BOOKING_STATUS_LABELS } from "@handwerker/ui";
import { BookingActions } from "@/components/BookingActions";

export default async function EquipmentBookingsPage() {
  const supabase = createServerSupabaseClient();
  const [bookings, equipment] = await Promise.all([getAllEquipmentBookings(supabase), getEquipmentCatalog(supabase)]);
  const equipmentNameById = new Map(equipment.map((e) => [e.id, e.name]));

  const now = new Date();
  const overdue = bookings.filter((b) => b.status === "checked_out" && new Date(b.end_at) < now);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Geräte-Buchungen</h1>

      {overdue.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {overdue.length} überfällige Rückgabe{overdue.length === 1 ? "" : "n"}.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Gerät</th>
              <th className="px-4 py-2">Zeitraum</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-4 py-2">{equipmentNameById.get(booking.equipment_id) ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">
                  {new Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format(new Date(booking.start_at))} –{" "}
                  {new Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format(new Date(booking.end_at))}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
                </td>
                <td className="px-4 py-2 text-right">
                  <BookingActions bookingId={booking.id} status={booking.status} />
                </td>
              </tr>
            ))}
            {bookings.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-400" colSpan={4}>
                  Noch keine Buchungen vorhanden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
