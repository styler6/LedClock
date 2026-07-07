import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEmployees } from "@handwerker/api-client";
import { RoleSelect } from "@/components/RoleSelect";

export default async function RolesPage() {
  const supabase = createServerSupabaseClient();
  const employees = await getEmployees(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Rollen</h1>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">E-Mail</th>
              <th className="px-4 py-2">Rolle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-2 font-medium">{employee.full_name}</td>
                <td className="px-4 py-2 text-gray-500">{employee.email}</td>
                <td className="px-4 py-2">
                  <RoleSelect profileId={employee.id} role={employee.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
