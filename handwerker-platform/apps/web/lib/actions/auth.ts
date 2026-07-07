"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface ActionResult {
  error?: string;
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

/**
 * Company signup: creates the auth user, the company row, and the first
 * `owner` profile in one privileged flow using the service-role client
 * (profiles has no public insert policy — see supabase/migrations
 * 20260101000600_rls_policies.sql), then signs the new user in.
 */
export async function registerCompany(formData: FormData): Promise<ActionResult> {
  const companyName = String(formData.get("companyName") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!companyName || !fullName || !email || !password) {
    return { error: "Bitte alle Felder ausfüllen." };
  }

  const admin = createAdminSupabaseClient();

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError || !userData.user) {
    return { error: userError?.message ?? "Registrierung fehlgeschlagen." };
  }

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: companyName })
    .select("*")
    .single();
  if (companyError) {
    return { error: companyError.message };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id,
    company_id: company.id,
    full_name: fullName,
    email,
    role: "owner",
  });
  if (profileError) {
    return { error: profileError.message };
  }

  const supabase = createServerSupabaseClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return { error: signInError.message };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
