"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { convertQuoteToInvoice, getCurrentProfile, markInvoicePaid, updateInvoiceStatus } from "@handwerker/api-client";
import type { Invoice } from "@handwerker/shared-types";

export async function convertQuoteToInvoiceAction(quoteId: string): Promise<{ error?: string; id?: string }> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) return { error: "Nicht angemeldet." };

  const invoice = await convertQuoteToInvoice(supabase, profile.company_id, quoteId, profile.id);
  revalidatePath("/quotes");
  revalidatePath("/invoices");
  return { id: invoice.id };
}

export async function markInvoicePaidAction(id: string): Promise<{ error?: string }> {
  const supabase = createServerSupabaseClient();
  await markInvoicePaid(supabase, id);
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  return {};
}

export async function updateInvoiceStatusAction(id: string, status: Invoice["status"]): Promise<{ error?: string }> {
  const supabase = createServerSupabaseClient();
  await updateInvoiceStatus(supabase, id, status);
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  return {};
}
