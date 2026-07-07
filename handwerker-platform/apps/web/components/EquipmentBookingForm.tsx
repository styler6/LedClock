"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Customer, Profile, Project } from "@handwerker/shared-types";
import { createBookingAction } from "@/lib/actions/equipment";

export function EquipmentBookingForm({
  equipmentId,
  customers,
  projects,
  employees,
}: {
  equipmentId: string;
  customers: Customer[];
  projects: Project[];
  employees: Profile[];
}) {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<"customer_rental" | "internal_project">("internal_project");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createBookingAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="equipmentId" value={equipmentId} />
      <div>
        <label className="block text-sm font-medium">Buchungstyp</label>
        <select
          name="bookingType"
          value={bookingType}
          onChange={(e) => setBookingType(e.target.value as typeof bookingType)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="internal_project">Interne Projektzuordnung</option>
          <option value="customer_rental">Kundenvermietung</option>
        </select>
      </div>

      {bookingType === "customer_rental" ? (
        <div>
          <label className="block text-sm font-medium">Kunde</label>
          <select name="customerId" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium">Projekt</label>
            <select name="projectId" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Mitarbeiter</label>
            <select name="assignedTo" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Von</label>
          <input name="startAt" type="datetime-local" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Bis</label>
          <input name="endAt" type="datetime-local" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Wird gebucht…" : "Buchen"}
      </button>
    </form>
  );
}
