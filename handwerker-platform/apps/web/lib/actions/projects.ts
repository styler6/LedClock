"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assignEmployeeToProject, createProject, getCurrentProfile, updateProjectStatus } from "@handwerker/api-client";
import type { Project } from "@handwerker/shared-types";

export async function createProjectAction(formData: FormData): Promise<void> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) throw new Error("Nicht angemeldet.");

  const customerId = String(formData.get("customerId") ?? "");
  const name = String(formData.get("name") ?? "");
  if (!customerId || !name) throw new Error("Kunde und Name sind erforderlich.");

  const project = await createProject(supabase, profile.company_id, profile.id, {
    customer_id: customerId,
    name,
    description: String(formData.get("description") ?? "") || null,
    site_address_street: String(formData.get("siteAddressStreet") ?? "") || null,
    site_address_zip: String(formData.get("siteAddressZip") ?? "") || null,
    site_address_city: String(formData.get("siteAddressCity") ?? "") || null,
    start_date: String(formData.get("startDate") ?? "") || null,
    end_date: String(formData.get("endDate") ?? "") || null,
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function assignEmployeeAction(projectId: string, profileId: string, role?: string): Promise<{ error?: string }> {
  await assignEmployeeToProject(createServerSupabaseClient(), projectId, profileId, role);
  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function assignEmployeeFormAction(formData: FormData): Promise<void> {
  const projectId = String(formData.get("projectId") ?? "");
  const profileId = String(formData.get("profileId") ?? "");
  const role = String(formData.get("role") ?? "") || undefined;
  if (!projectId || !profileId) return;

  await assignEmployeeToProject(createServerSupabaseClient(), projectId, profileId, role);
  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectStatusAction(projectId: string, status: Project["status"], note?: string): Promise<{ error?: string }> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) return { error: "Nicht angemeldet." };

  await updateProjectStatus(supabase, projectId, status, profile.id, note);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return {};
}
