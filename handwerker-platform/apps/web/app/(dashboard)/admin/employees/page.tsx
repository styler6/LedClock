import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEmployees } from "@handwerker/api-client";
import { inviteEmployeeAction } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

const ROLE_LABELS: Record<string, string> = { owner: "Owner", admin: "Admin", employee: "Mitarbeiter" };

export default async function EmployeesPage() {
  const supabase = createServerSupabaseClient();
  const employees = await getEmployees(supabase);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Mitarbeiter</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">E-Mail</th>
              <th className="px-4 py-2">Rolle</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-2 font-medium">{employee.full_name}</td>
                <td className="px-4 py-2 text-gray-500">{employee.email}</td>
                <td className="px-4 py-2 text-gray-500">{ROLE_LABELS[employee.role]}</td>
                <td className="px-4 py-2 text-gray-500">{employee.is_active ? "Aktiv" : "Inaktiv"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-medium">Mitarbeiter einladen</h2>
        <form action={inviteEmployeeAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="fullName">
              Name
            </label>
            <input id="fullName" name="fullName" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              E-Mail
            </label>
            <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="role">
              Rolle
            </label>
            <select id="role" name="role" defaultValue="employee" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="employee">Mitarbeiter</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <SubmitButton>Einladung senden</SubmitButton>
        </form>
      </div>
    </div>
  );
}
