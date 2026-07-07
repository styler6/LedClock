import type { Profile } from "@handwerker/shared-types";
import type { HandwerkerSupabaseClient } from "./client-factory";

export async function signInWithPassword(client: HandwerkerSupabaseClient, email: string, password: string) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut(client: HandwerkerSupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

/** The logged-in user's own profile row (company_id, role, etc.) — used to drive RLS-aware UI decisions. */
export async function getCurrentProfile(client: HandwerkerSupabaseClient): Promise<Profile | null> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const { data, error } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  return data;
}
