import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { Company, Customer, Quote, QuoteLineItem } from "@handwerker/shared-types";
import { CompanyHeader, CustomerBlock, LineItemsTable, TotalsBlock, formatDate, styles } from "./shared";

export interface QuotePdfProps {
  company: Company;
  customer: Customer;
  quote: Quote;
  lineItems: QuoteLineItem[];
}

export function QuotePdf({ company, customer, quote, lineItems }: QuotePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <CompanyHeader company={company} />
          <View style={styles.metaBlock}>
            <Text style={styles.title}>Kostenvoranschlag</Text>
            <Text>Nr. {quote.quote_number}</Text>
            <Text>Datum: {formatDate(quote.issue_date)}</Text>
            {quote.valid_until ? <Text>Gültig bis: {formatDate(quote.valid_until)}</Text> : null}
          </View>
        </View>

        <CustomerBlock customer={customer} />

        <LineItemsTable items={lineItems} />
        <TotalsBlock subtotal={quote.subtotal} taxTotal={quote.tax_total} total={quote.total} />

        {quote.notes ? <Text style={styles.notes}>{quote.notes}</Text> : null}
        {quote.terms ? <Text style={styles.notes}>{quote.terms}</Text> : null}
      </Page>
    </Document>
  );
}
