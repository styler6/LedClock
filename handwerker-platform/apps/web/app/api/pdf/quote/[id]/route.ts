import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePdf } from "@handwerker/pdf";
import { getCompany, getCustomer, getQuote, setQuotePdfUrl } from "@handwerker/api-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const quote = await getQuote(supabase, params.id);
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  const [company, customer] = await Promise.all([
    getCompany(supabase, quote.company_id),
    getCustomer(supabase, quote.customer_id),
  ]);
  if (!company || !customer) return NextResponse.json({ error: "Company or customer not found" }, { status: 404 });

  const pdfBuffer = await renderToBuffer(
    QuotePdf({ company, customer, quote, lineItems: quote.quote_line_items }),
  );

  const storagePath = `${company.id}/${quote.id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("quote-pdfs")
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (!uploadError) {
    await setQuotePdfUrl(supabase, quote.id, storagePath);
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.quote_number}.pdf"`,
    },
  });
}
