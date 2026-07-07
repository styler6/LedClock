import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomers, getProjects } from "@handwerker/api-client";
import { QuoteForm } from "@/components/QuoteForm";

export default async function NewQuotePage() {
  const supabase = createServerSupabaseClient();
  const [customers, projects] = await Promise.all([getCustomers(supabase), getProjects(supabase)]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Neues Angebot</h1>
      {customers.length === 0 ? (
        <p className="text-sm text-gray-500">Bitte legen Sie zuerst einen Kunden an.</p>
      ) : (
        <QuoteForm customers={customers} projects={projects} />
      )}
    </div>
  );
}
