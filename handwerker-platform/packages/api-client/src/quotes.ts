import type { Quote, QuoteLineItem } from "@handwerker/shared-types";
import { calculateDocumentTotals, calculateLineTotal, type QuoteInput } from "@handwerker/domain";
import type { HandwerkerSupabaseClient } from "./client-factory";

export interface QuoteWithLineItems extends Quote {
  quote_line_items: QuoteLineItem[];
}

export async function getQuotes(client: HandwerkerSupabaseClient): Promise<Quote[]> {
  const { data, error } = await client.from("quotes").select("*").order("issue_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getQuote(client: HandwerkerSupabaseClient, id: string): Promise<QuoteWithLineItems | null> {
  const { data, error } = await client
    .from("quotes")
    .select("*, quote_line_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as QuoteWithLineItems | null;
}

export async function createQuote(
  client: HandwerkerSupabaseClient,
  companyId: string,
  createdBy: string,
  input: QuoteInput,
): Promise<QuoteWithLineItems> {
  const { data: quoteNumber, error: numberError } = await client.rpc("next_document_number", {
    p_company_id: companyId,
    p_doc_type: "quote",
  });
  if (numberError) throw numberError;

  const totals = calculateDocumentTotals(
    input.lineItems.map((item) => ({ quantity: item.quantity, unitPrice: item.unitPrice, taxRate: item.taxRate })),
  );

  const { data: quote, error: quoteError } = await client
    .from("quotes")
    .insert({
      company_id: companyId,
      customer_id: input.customerId,
      project_id: input.projectId ?? null,
      quote_number: quoteNumber as string,
      valid_until: input.validUntil ?? null,
      notes: input.notes ?? null,
      terms: input.terms ?? null,
      subtotal: totals.subtotal,
      tax_total: totals.taxTotal,
      total: totals.total,
      created_by: createdBy,
    })
    .select("*")
    .single();
  if (quoteError) throw quoteError;

  const { data: lineItems, error: lineItemsError } = await client
    .from("quote_line_items")
    .insert(
      input.lineItems.map((item, index) => ({
        quote_id: quote.id,
        position: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        line_total: calculateLineTotal({ quantity: item.quantity, unitPrice: item.unitPrice, taxRate: item.taxRate }),
      })),
    )
    .select("*");
  if (lineItemsError) throw lineItemsError;

  return { ...quote, quote_line_items: lineItems };
}

export async function updateQuoteStatus(
  client: HandwerkerSupabaseClient,
  id: string,
  status: Quote["status"],
): Promise<Quote> {
  const { data, error } = await client.from("quotes").update({ status }).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function setQuotePdfUrl(client: HandwerkerSupabaseClient, id: string, pdfUrl: string): Promise<void> {
  const { error } = await client.from("quotes").update({ pdf_url: pdfUrl }).eq("id", id);
  if (error) throw error;
}
