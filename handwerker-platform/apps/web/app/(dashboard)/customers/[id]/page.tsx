import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomer, getInvoices, getProjects, getQuotes } from "@handwerker/api-client";
import { StatusBadge, QUOTE_STATUS_LABELS, INVOICE_STATUS_LABELS, PROJECT_STATUS_LABELS } from "@handwerker/ui";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const [customer, quotes, invoices, projects] = await Promise.all([
    getCustomer(supabase, params.id),
    getQuotes(supabase),
    getInvoices(supabase),
    getProjects(supabase),
  ]);

  if (!customer) notFound();

  const customerQuotes = quotes.filter((q) => q.customer_id === customer.id);
  const customerInvoices = invoices.filter((i) => i.customer_id === customer.id);
  const customerProjects = projects.filter((p) => p.customer_id === customer.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{customer.name}</h1>
        <p className="text-sm text-gray-500">{customer.type === "business" ? "Gewerblich" : "Privat"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-medium">Stammdaten</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Ansprechpartner</dt><dd>{customer.contact_person ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">E-Mail</dt><dd>{customer.email ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Telefon</dt><dd>{customer.phone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Adresse</dt><dd>{[customer.address_street, `${customer.address_zip ?? ""} ${customer.address_city ?? ""}`.trim()].filter(Boolean).join(", ") || "—"}</dd></div>
          </dl>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-medium">Projekte</h2>
          <ul className="space-y-2 text-sm">
            {customerProjects.map((project) => (
              <li key={project.id} className="flex items-center justify-between">
                <Link className="hover:underline" href={`/projects/${project.id}`}>{project.name}</Link>
                <StatusBadge status={project.status} labels={PROJECT_STATUS_LABELS} />
              </li>
            ))}
            {customerProjects.length === 0 ? <li className="text-gray-400">Keine Projekte</li> : null}
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-medium">Angebote</h2>
          <ul className="space-y-2 text-sm">
            {customerQuotes.map((quote) => (
              <li key={quote.id} className="flex items-center justify-between">
                <Link className="hover:underline" href={`/quotes/${quote.id}`}>{quote.quote_number}</Link>
                <StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} />
              </li>
            ))}
            {customerQuotes.length === 0 ? <li className="text-gray-400">Keine Angebote</li> : null}
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-medium">Rechnungen</h2>
          <ul className="space-y-2 text-sm">
            {customerInvoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between">
                <Link className="hover:underline" href={`/invoices/${invoice.id}`}>{invoice.invoice_number}</Link>
                <StatusBadge status={invoice.status} labels={INVOICE_STATUS_LABELS} />
              </li>
            ))}
            {customerInvoices.length === 0 ? <li className="text-gray-400">Keine Rechnungen</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
