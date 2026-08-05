import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomers } from "@handwerker/api-client";
import { createCustomerAction } from "@/lib/actions/customers";
import { SubmitButton } from "@/components/SubmitButton";

export default async function CustomersPage() {
  const supabase = createServerSupabaseClient();
  const customers = await getCustomers(supabase);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kunden</h1>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Typ</th>
              <th className="px-4 py-2">E-Mail</th>
              <th className="px-4 py-2">Telefon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-2">
                  <Link className="font-medium text-gray-900 hover:underline" href={`/customers/${customer.id}`}>
                    {customer.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-500">{customer.type === "business" ? "Gewerblich" : "Privat"}</td>
                <td className="px-4 py-2 text-gray-500">{customer.email}</td>
                <td className="px-4 py-2 text-gray-500">{customer.phone}</td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-400" colSpan={4}>
                  Noch keine Kunden angelegt.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-medium">Neuen Kunden anlegen</h2>
        <form action={createCustomerAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="type">
              Typ
            </label>
            <select id="type" name="type" defaultValue="private" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="private">Privat</option>
              <option value="business">Gewerblich</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="contactPerson">
              Ansprechpartner
            </label>
            <input id="contactPerson" name="contactPerson" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="email">
                E-Mail
              </label>
              <input id="email" name="email" type="email" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="phone">
                Telefon
              </label>
              <input id="phone" name="phone" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="addressStreet">
              Straße
            </label>
            <input id="addressStreet" name="addressStreet" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="addressZip">
                PLZ
              </label>
              <input id="addressZip" name="addressZip" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="addressCity">
                Ort
              </label>
              <input id="addressCity" name="addressCity" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <SubmitButton>Kunde anlegen</SubmitButton>
        </form>
      </div>
    </div>
  );
}
