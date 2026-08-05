import type { Invoice, InvoiceLineItem } from "@handwerker/shared-types";
import type { HandwerkerSupabaseClient } from "./client-factory";
import { getQuote } from "./quotes";

export interface InvoiceWithLineItems extends Invoice {
  invoice_line_items: InvoiceLineItem[];
}

export async function getInvoices(client: HandwerkerSupabaseClient): Promise<Invoice[]> {
  const { data, error } = await client.from("invoices").select("*").order("issue_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getInvoice(client: HandwerkerSupabaseClient, id: string): Promise<InvoiceWithLineItems | null> {
  const { data, error } = await client
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as InvoiceWithLineItems | null;
}

/**
 * Converts an accepted quote into a new invoice, copying its line items
 * 1:1 and marking the source quote as `converted`. Requires its own
 * document number (invoices and quotes are numbered independently).
 */
export async function convertQuoteToInvoice(
  client: HandwerkerSupabaseClient,
  companyId: string,
  quoteId: string,
  createdBy: string,
  dueDate?: string,
): Promise<InvoiceWithLineItems> {
  const quote = await getQuote(client, quoteId);
  if (!quote) throw new Error(`Quote ${quoteId} not found`);

  const { data: invoiceNumber, error: numberError } = await client.rpc("next_document_number", {
    p_company_id: companyId,
    p_doc_type: "invoice",
  });
  if (numberError) throw numberError;

  const { data: invoice, error: invoiceError } = await client
    .from("invoices")
    .insert({
      company_id: companyId,
      customer_id: quote.customer_id,
      quote_id: quote.id,
      project_id: quote.project_id,
      invoice_number: invoiceNumber as string,
      due_date: dueDate ?? null,
      subtotal: quote.subtotal,
      tax_total: quote.tax_total,
      total: quote.total,
      notes: quote.notes,
      created_by: createdBy,
    })
    .select("*")
    .single();
  if (invoiceError) throw invoiceError;

  const { data: lineItems, error: lineItemsError } = await client
    .from("invoice_line_items")
    .insert(
      quote.quote_line_items.map((item) => ({
        invoice_id: invoice.id,
        position: item.position,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        line_total: item.line_total,
      })),
    )
    .select("*");
  if (lineItemsError) throw lineItemsError;

  const { error: quoteUpdateError } = await client.from("quotes").update({ status: "converted" }).eq("id", quoteId);
  if (quoteUpdateError) throw quoteUpdateError;

  return { ...invoice, invoice_line_items: lineItems };
}

export async function markInvoicePaid(client: HandwerkerSupabaseClient, id: string): Promise<Invoice> {
  const { data, error } = await client
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateInvoiceStatus(
  client: HandwerkerSupabaseClient,
  id: string,
  status: Invoice["status"],
): Promise<Invoice> {
  const { data, error } = await client.from("invoices").update({ status }).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function setInvoicePdfUrl(client: HandwerkerSupabaseClient, id: string, pdfUrl: string): Promise<void> {
  const { error } = await client.from("invoices").update({ pdf_url: pdfUrl }).eq("id", id);
  if (error) throw error;
}
