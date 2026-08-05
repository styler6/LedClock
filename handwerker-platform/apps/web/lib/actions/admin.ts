"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getCurrentProfile, setEmployeeRole, updateCompany } from "@handwerker/api-client";
import type { Role } from "@handwerker/shared-types";

/**
 * Invites a new employee: creates their auth user + profile row via the
 * service-role client (profiles has no public insert policy), defaulting to
 * the `employee` role. Only owner/admin can reach this page in the UI, but
 * we also re-check the caller's role here since this bypasses RLS.
 */
export async function inviteEmployeeAction(formData: FormData): Promise<void> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || (profile.role !== "owner" && profile.role !== "admin")) {
    throw new Error("Nicht berechtigt.");
  }

  const email = String(formData.get("email") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const role = (String(formData.get("role") ?? "employee") as Role) ?? "employee";
  if (!email || !fullName) throw new Error("Name und E-Mail sind erforderlich.");

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error || !data.user) throw new Error(error?.message ?? "Einladung fehlgeschlagen.");

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    company_id: profile.company_id,
    full_name: fullName,
    email,
    role,
  });
  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/employees");
}

export async function setEmployeeRoleAction(profileId: string, role: Role): Promise<{ error?: string }> {
  await setEmployeeRole(createServerSupabaseClient(), profileId, role);
  revalidatePath("/admin/employees");
  return {};
}

export async function updateCompanyAction(formData: FormData): Promise<void> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) throw new Error("Nicht angemeldet.");

  await updateCompany(supabase, profile.company_id, {
    name: String(formData.get("name") ?? ""),
    legal_name: String(formData.get("legalName") ?? "") || null,
    address_street: String(formData.get("addressStreet") ?? "") || null,
    address_zip: String(formData.get("addressZip") ?? "") || null,
    address_city: String(formData.get("addressCity") ?? "") || null,
    tax_id: String(formData.get("taxId") ?? "") || null,
    vat_id: String(formData.get("vatId") ?? "") || null,
    iban: String(formData.get("iban") ?? "") || null,
    bic: String(formData.get("bic") ?? "") || null,
    quote_number_prefix: String(formData.get("quoteNumberPrefix") ?? "AN"),
    invoice_number_prefix: String(formData.get("invoiceNumberPrefix") ?? "RE"),
  });

  revalidatePath("/admin/company");
}
