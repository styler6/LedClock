import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf } from "@handwerker/pdf";
import { getCompany, getCustomer, getInvoice, setInvoicePdfUrl } from "@handwerker/api-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const invoice = await getInvoice(supabase, params.id);
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const [company, customer] = await Promise.all([
    getCompany(supabase, invoice.company_id),
    getCustomer(supabase, invoice.customer_id),
  ]);
  if (!company || !customer) return NextResponse.json({ error: "Company or customer not found" }, { status: 404 });

  const pdfBuffer = await renderToBuffer(
    InvoicePdf({ company, customer, invoice, lineItems: invoice.invoice_line_items }),
  );

  const storagePath = `${company.id}/${invoice.id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("invoice-pdfs")
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (!uploadError) {
    await setInvoicePdfUrl(supabase, invoice.id, storagePath);
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
