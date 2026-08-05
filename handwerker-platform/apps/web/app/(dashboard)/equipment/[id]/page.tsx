import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomers, getEmployees, getEquipmentBookings, getEquipmentById, getProjects } from "@handwerker/api-client";
import { StatusBadge, BOOKING_STATUS_LABELS } from "@handwerker/ui";
import { EquipmentBookingForm } from "@/components/EquipmentBookingForm";

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const equipment = await getEquipmentById(supabase, params.id);
  if (!equipment) notFound();

  const [bookings, customers, projects, employees] = await Promise.all([
    getEquipmentBookings(supabase, equipment.id),
    getCustomers(supabase),
    getProjects(supabase),
    getEmployees(supabase),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{equipment.name}</h1>
        <p className="text-sm text-gray-500">{equipment.category}</p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-medium">Buchungen</h2>
        <ul className="space-y-2 text-sm">
          {bookings.map((booking) => (
            <li key={booking.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
              <span>
                {new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(new Date(booking.start_at))} –{" "}
                {new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(new Date(booking.end_at))}
              </span>
              <StatusBadge status={booking.status} labels={BOOKING_STATUS_LABELS} />
            </li>
          ))}
          {bookings.length === 0 ? <li className="text-gray-400">Keine Buchungen vorhanden</li> : null}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-medium">Neue Buchung</h2>
        <EquipmentBookingForm equipmentId={equipment.id} customers={customers} projects={projects} employees={employees} />
      </section>
    </div>
  );
}
