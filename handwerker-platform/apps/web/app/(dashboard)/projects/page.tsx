import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomers, getProjects } from "@handwerker/api-client";
import { StatusBadge, PROJECT_STATUS_LABELS } from "@handwerker/ui";
import { createProjectAction } from "@/lib/actions/projects";
import { SubmitButton } from "@/components/SubmitButton";

export default async function ProjectsPage() {
  const supabase = createServerSupabaseClient();
  const [projects, customers] = await Promise.all([getProjects(supabase), getCustomers(supabase)]);
  const customerNameById = new Map(customers.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Projekte / Baustellen</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Projekt</th>
              <th className="px-4 py-2">Kunde</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Zeitraum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-2">
                  <Link className="font-medium hover:underline" href={`/projects/${project.id}`}>
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-500">{customerNameById.get(project.customer_id) ?? "—"}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={project.status} labels={PROJECT_STATUS_LABELS} />
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {project.start_date ?? "—"} – {project.end_date ?? "—"}
                </td>
              </tr>
            ))}
            {projects.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-400" colSpan={4}>
                  Noch keine Projekte angelegt.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-medium">Neues Projekt anlegen</h2>
        <form action={createProjectAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="customerId">
              Kunde
            </label>
            <select id="customerId" name="customerId" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="name">
              Projektname
            </label>
            <input id="name" name="name" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="description">
              Beschreibung
            </label>
            <textarea id="description" name="description" rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="siteAddressStreet">
              Baustellenadresse
            </label>
            <input id="siteAddressStreet" name="siteAddressStreet" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="siteAddressZip">
                PLZ
              </label>
              <input id="siteAddressZip" name="siteAddressZip" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="siteAddressCity">
                Ort
              </label>
              <input id="siteAddressCity" name="siteAddressCity" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="startDate">
                Start
              </label>
              <input id="startDate" name="startDate" type="date" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="endDate">
                Ende
              </label>
              <input id="endDate" name="endDate" type="date" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <SubmitButton>Projekt anlegen</SubmitButton>
        </form>
      </div>
    </div>
  );
}
