import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomers, getInvoices } from "@handwerker/api-client";
import { StatusBadge, INVOICE_STATUS_LABELS } from "@handwerker/ui";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export default async function InvoicesPage() {
  const supabase = createServerSupabaseClient();
  const [invoices, customers] = await Promise.all([getInvoices(supabase), getCustomers(supabase)]);
  const customerNameById = new Map(customers.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Rechnungen</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Nr.</th>
              <th className="px-4 py-2">Kunde</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Fällig</th>
              <th className="px-4 py-2 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-4 py-2">
                  <Link className="font-medium hover:underline" href={`/invoices/${invoice.id}`}>
                    {invoice.invoice_number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-500">{customerNameById.get(invoice.customer_id) ?? "—"}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={invoice.status} labels={INVOICE_STATUS_LABELS} />
                </td>
                <td className="px-4 py-2 text-gray-500">{invoice.due_date ? new Intl.DateTimeFormat("de-DE").format(new Date(invoice.due_date)) : "—"}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(invoice.total)}</td>
              </tr>
            ))}
            {invoices.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-400" colSpan={5}>
                  Noch keine Rechnungen vorhanden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
