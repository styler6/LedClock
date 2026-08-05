import type { Project, ProjectAssignment, ProjectStatusHistoryEntry } from "@handwerker/shared-types";
import type { HandwerkerSupabaseClient } from "./client-factory";

export interface ProjectWithAssignments extends Project {
  project_assignments: ProjectAssignment[];
}

export async function getProjects(client: HandwerkerSupabaseClient): Promise<Project[]> {
  const { data, error } = await client.from("projects").select("*").order("start_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getProject(client: HandwerkerSupabaseClient, id: string): Promise<ProjectWithAssignments | null> {
  const { data, error } = await client
    .from("projects")
    .select("*, project_assignments(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as ProjectWithAssignments | null;
}

/** "Meine Aufträge" for the mobile app: projects the given employee is assigned to. */
export async function getProjectsForEmployee(client: HandwerkerSupabaseClient, profileId: string): Promise<Project[]> {
  const { data: assignments, error: assignmentsError } = await client
    .from("project_assignments")
    .select("project_id")
    .eq("profile_id", profileId);
  if (assignmentsError) throw assignmentsError;

  const projectIds = assignments.map((a) => a.project_id);
  if (projectIds.length === 0) return [];

  const { data: projects, error: projectsError } = await client.from("projects").select("*").in("id", projectIds);
  if (projectsError) throw projectsError;
  return projects;
}

export async function createProject(
  client: HandwerkerSupabaseClient,
  companyId: string,
  createdBy: string,
  input: Pick<Project, "customer_id" | "name"> & Partial<Project>,
): Promise<Project> {
  const { data, error } = await client
    .from("projects")
    .insert({ ...input, company_id: companyId, created_by: createdBy })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function assignEmployeeToProject(
  client: HandwerkerSupabaseClient,
  projectId: string,
  profileId: string,
  roleOnProject?: string,
): Promise<ProjectAssignment> {
  const { data, error } = await client
    .from("project_assignments")
    .insert({ project_id: projectId, profile_id: profileId, role_on_project: roleOnProject ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Updates project status and appends a status_history row so the timeline in the UI stays accurate. */
export async function updateProjectStatus(
  client: HandwerkerSupabaseClient,
  projectId: string,
  status: Project["status"],
  changedBy: string,
  note?: string,
): Promise<Project> {
  const { data, error } = await client
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .select("*")
    .single();
  if (error) throw error;

  const { error: historyError } = await client
    .from("project_status_history")
    .insert({ project_id: projectId, status, changed_by: changedBy, note: note ?? null });
  if (historyError) throw historyError;

  return data;
}

export async function getProjectStatusHistory(
  client: HandwerkerSupabaseClient,
  projectId: string,
): Promise<ProjectStatusHistoryEntry[]> {
  const { data, error } = await client
    .from("project_status_history")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
