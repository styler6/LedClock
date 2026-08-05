import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomers, getQuotes } from "@handwerker/api-client";
import { StatusBadge, QUOTE_STATUS_LABELS } from "@handwerker/ui";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export default async function QuotesPage() {
  const supabase = createServerSupabaseClient();
  const [quotes, customers] = await Promise.all([getQuotes(supabase), getCustomers(supabase)]);
  const customerNameById = new Map(customers.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Angebote</h1>
        <Link href="/quotes/new" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Neues Angebot
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Nr.</th>
              <th className="px-4 py-2">Kunde</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Datum</th>
              <th className="px-4 py-2 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td className="px-4 py-2">
                  <Link className="font-medium hover:underline" href={`/quotes/${quote.id}`}>
                    {quote.quote_number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-500">{customerNameById.get(quote.customer_id) ?? "—"}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} />
                </td>
                <td className="px-4 py-2 text-gray-500">{new Intl.DateTimeFormat("de-DE").format(new Date(quote.issue_date))}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(quote.total)}</td>
              </tr>
            ))}
            {quotes.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-400" colSpan={5}>
                  Noch keine Angebote erstellt.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
