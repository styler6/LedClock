import type { Profile } from "@handwerker/shared-types";
import type { HandwerkerSupabaseClient } from "./client-factory";

export async function getEmployees(client: HandwerkerSupabaseClient): Promise<Profile[]> {
  const { data, error } = await client.from("profiles").select("*").order("full_name");
  if (error) throw error;
  return data;
}

export async function setEmployeeRole(client: HandwerkerSupabaseClient, profileId: string, role: Profile["role"]): Promise<void> {
  const { error } = await client.rpc("set_employee_role", { target_profile_id: profileId, new_role: role });
  if (error) throw error;
}
