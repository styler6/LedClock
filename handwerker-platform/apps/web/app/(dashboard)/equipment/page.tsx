import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEquipmentCatalog } from "@handwerker/api-client";
import { createEquipmentAction } from "@/lib/actions/equipment";
import { SubmitButton } from "@/components/SubmitButton";

const STATUS_LABELS: Record<string, string> = {
  available: "Verfügbar",
  booked: "Gebucht",
  in_use: "Im Einsatz",
  maintenance: "Wartung",
  retired: "Ausgemustert",
};

export default async function EquipmentPage() {
  const supabase = createServerSupabaseClient();
  const equipment = await getEquipmentCatalog(supabase);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Geräte</h1>
        <Link href="/equipment/bookings" className="text-sm font-medium text-gray-900 underline">
          Alle Buchungen
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => (
          <Link
            key={item.id}
            href={`/equipment/${item.id}`}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-400"
          >
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">{item.category}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">{STATUS_LABELS[item.status]}</p>
            {item.daily_rental_price ? (
              <p className="mt-1 text-sm text-gray-600">
                {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(item.daily_rental_price)} / Tag
              </p>
            ) : null}
          </Link>
        ))}
        {equipment.length === 0 ? <p className="text-gray-400">Noch keine Geräte angelegt.</p> : null}
      </div>

      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-medium">Neues Gerät anlegen</h2>
        <form action={createEquipmentAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="category">
              Kategorie
            </label>
            <input id="category" name="category" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="dailyRentalPrice">
              Tagesmietpreis (€)
            </label>
            <input id="dailyRentalPrice" name="dailyRentalPrice" type="number" step="0.01" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input id="isRentableToCustomers" name="isRentableToCustomers" type="checkbox" defaultChecked />
            <label className="text-sm" htmlFor="isRentableToCustomers">
              An Kunden vermietbar
            </label>
          </div>
          <SubmitButton>Gerät anlegen</SubmitButton>
        </form>
      </div>
    </div>
  );
}
