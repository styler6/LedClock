import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomer, getQuote } from "@handwerker/api-client";
import { StatusBadge, QUOTE_STATUS_LABELS } from "@handwerker/ui";
import { QuoteActions } from "@/components/QuoteActions";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const quote = await getQuote(supabase, params.id);
  if (!quote) notFound();

  const customer = await getCustomer(supabase, quote.customer_id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{quote.quote_number}</h1>
          <p className="text-sm text-gray-500">{customer?.name}</p>
        </div>
        <StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} />
      </div>

      <QuoteActions id={quote.id} status={quote.status} />

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
            {quote.quote_line_items.map((item) => (
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
        <div className="flex justify-between"><span>Zwischensumme</span><span>{formatCurrency(quote.subtotal)}</span></div>
        <div className="flex justify-between"><span>MwSt.</span><span>{formatCurrency(quote.tax_total)}</span></div>
        <div className="flex justify-between border-t border-gray-900 pt-1 font-semibold"><span>Gesamt</span><span>{formatCurrency(quote.total)}</span></div>
      </div>

      {quote.notes ? <p className="text-sm text-gray-600">{quote.notes}</p> : null}
    </div>
  );
}
