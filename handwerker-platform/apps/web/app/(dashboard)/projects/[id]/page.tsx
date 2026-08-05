import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getCustomer,
  getEmployees,
  getInvoices,
  getProject,
  getProjectStatusHistory,
  getQuotes,
} from "@handwerker/api-client";
import { StatusBadge, QUOTE_STATUS_LABELS, INVOICE_STATUS_LABELS } from "@handwerker/ui";
import { ProjectStatusControl } from "@/components/ProjectStatusControl";
import { assignEmployeeFormAction } from "@/lib/actions/projects";
import { SubmitButton } from "@/components/SubmitButton";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const project = await getProject(supabase, params.id);
  if (!project) notFound();

  const [customer, employees, history, quotes, invoices] = await Promise.all([
    getCustomer(supabase, project.customer_id),
    getEmployees(supabase),
    getProjectStatusHistory(supabase, project.id),
    getQuotes(supabase),
    getInvoices(supabase),
  ]);

  const projectQuotes = quotes.filter((q) => q.project_id === project.id);
  const projectInvoices = invoices.filter((i) => i.project_id === project.id);
  const assignedProfileIds = new Set(project.project_assignments.map((a) => a.profile_id));
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-gray-500">{customer?.name}</p>
        </div>
        <ProjectStatusControl projectId={project.id} status={project.status} />
      </div>

      {project.description ? <p className="text-sm text-gray-600">{project.description}</p> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-medium">Mitarbeiter</h2>
          <ul className="mb-3 space-y-1 text-sm">
            {project.project_assignments.map((assignment) => (
              <li key={assignment.id}>
                {employeeById.get(assignment.profile_id)?.full_name ?? assignment.profile_id}
                {assignment.role_on_project ? ` (${assignment.role_on_project})` : ""}
              </li>
            ))}
            {project.project_assignments.length === 0 ? <li className="text-gray-400">Noch niemand zugewiesen</li> : null}
          </ul>
          <form action={assignEmployeeFormAction} className="flex gap-2">
            <input type="hidden" name="projectId" value={project.id} />
            <select name="profileId" required className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm">
              {employees
                .filter((e) => !assignedProfileIds.has(e.id))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name}
                  </option>
                ))}
            </select>
            <SubmitButton>Zuweisen</SubmitButton>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-medium">Status-Verlauf</h2>
          <ul className="space-y-1 text-sm">
            {history.map((entry) => (
              <li key={entry.id} className="text-gray-600">
                {new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(new Date(entry.created_at))} — {entry.status}
                {entry.note ? `: ${entry.note}` : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-medium">Angebote</h2>
          <ul className="space-y-2 text-sm">
            {projectQuotes.map((quote) => (
              <li key={quote.id} className="flex items-center justify-between">
                <span>{quote.quote_number}</span>
                <StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} />
              </li>
            ))}
            {projectQuotes.length === 0 ? <li className="text-gray-400">Keine Angebote verknüpft</li> : null}
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-medium">Rechnungen</h2>
          <ul className="space-y-2 text-sm">
            {projectInvoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between">
                <span>{invoice.invoice_number}</span>
                <StatusBadge status={invoice.status} labels={INVOICE_STATUS_LABELS} />
              </li>
            ))}
            {projectInvoices.length === 0 ? <li className="text-gray-400">Keine Rechnungen verknüpft</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
