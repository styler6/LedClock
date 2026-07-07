import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomers, getEquipmentCatalog, getInvoices, getProjects, getQuotes } from "@handwerker/api-client";

function KpiTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const [customers, quotes, invoices, projects, equipment] = await Promise.all([
    getCustomers(supabase),
    getQuotes(supabase),
    getInvoices(supabase),
    getProjects(supabase),
    getEquipmentCatalog(supabase),
  ]);

  const openQuotes = quotes.filter((q) => q.status === "sent").length;
  const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;
  const activeProjects = projects.filter((p) => p.status === "in_progress").length;
  const equipmentInUse = equipment.filter((e) => e.status === "in_use" || e.status === "booked").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Übersicht</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiTile label="Kunden" value={customers.length} />
        <KpiTile label="Offene Angebote" value={openQuotes} />
        <KpiTile label="Überfällige Rechnungen" value={overdueInvoices} />
        <KpiTile label="Laufende Projekte" value={activeProjects} />
        <KpiTile label="Geräte in Nutzung" value={equipmentInUse} />
        <KpiTile label="Geräte gesamt" value={equipment.length} />
      </div>
    </div>
  );
}
