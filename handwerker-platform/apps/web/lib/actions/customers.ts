"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createCustomer, getCurrentProfile } from "@handwerker/api-client";
import { customerInputSchema } from "@handwerker/domain";

export async function createCustomerAction(formData: FormData): Promise<void> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) throw new Error("Nicht angemeldet.");

  const parsed = customerInputSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    contactPerson: formData.get("contactPerson") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    addressStreet: formData.get("addressStreet") || undefined,
    addressZip: formData.get("addressZip") || undefined,
    addressCity: formData.get("addressCity") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ungültige Eingabe.");
  }

  const customer = await createCustomer(supabase, profile.company_id, parsed.data);
  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}
