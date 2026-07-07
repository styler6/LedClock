import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomer, getInvoice } from "@handwerker/api-client";
import { StatusBadge, INVOICE_STATUS_LABELS } from "@handwerker/ui";
import { InvoiceActions } from "@/components/InvoiceActions";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const invoice = await getInvoice(supabase, params.id);
  if (!invoice) notFound();

  const customer = await getCustomer(supabase, invoice.customer_id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{invoice.invoice_number}</h1>
          <p className="text-sm text-gray-500">{customer?.name}</p>
        </div>
        <StatusBadge status={invoice.status} labels={INVOICE_STATUS_LABELS} />
      </div>

      <InvoiceActions id={invoice.id} status={invoice.status} />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Beschreibung</th>
              <th className="px-4 py-2 text-right">Menge</th>
              <th className="px-4 py-2">Einheit</th>
              <th className="px-4 py-2 text-right">Einzelpreis</th>
              <th className="px-4 py-2 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.invoice_line_items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2 text-right">{item.quantity}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between"><span>Zwischensumme</span><span>{formatCurrency(invoice.subtotal)}</span></div>
        <div className="flex justify-between"><span>MwSt.</span><span>{formatCurrency(invoice.tax_total)}</span></div>
        <div className="flex justify-between border-t border-gray-900 pt-1 font-semibold"><span>Gesamt</span><span>{formatCurrency(invoice.total)}</span></div>
      </div>
    </div>
  );
}
