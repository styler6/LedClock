"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createQuote, getCurrentProfile, updateQuoteStatus } from "@handwerker/api-client";
import { quoteInputSchema, type QuoteInput } from "@handwerker/domain";
import type { Quote } from "@handwerker/shared-types";

export interface CreateQuoteResult {
  error?: string;
  id?: string;
}

export async function createQuoteAction(input: QuoteInput): Promise<CreateQuoteResult> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) return { error: "Nicht angemeldet." };

  const parsed = quoteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const quote = await createQuote(supabase, profile.company_id, profile.id, parsed.data);
  revalidatePath("/quotes");
  return { id: quote.id };
}

export async function updateQuoteStatusAction(id: string, status: Quote["status"]): Promise<{ error?: string }> {
  const supabase = createServerSupabaseClient();
  await updateQuoteStatus(supabase, id, status);
  revalidatePath(`/quotes/${id}`);
  revalidatePath("/quotes");
  return {};
}
