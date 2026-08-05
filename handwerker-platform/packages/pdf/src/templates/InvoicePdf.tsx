import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { Company, Customer, Invoice, InvoiceLineItem } from "@handwerker/shared-types";
import { CompanyHeader, CustomerBlock, LineItemsTable, TotalsBlock, formatDate, styles } from "./shared";

export interface InvoicePdfProps {
  company: Company;
  customer: Customer;
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
}

export function InvoicePdf({ company, customer, invoice, lineItems }: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <CompanyHeader company={company} />
          <View style={styles.metaBlock}>
            <Text style={styles.title}>Rechnung</Text>
            <Text>Nr. {invoice.invoice_number}</Text>
            <Text>Datum: {formatDate(invoice.issue_date)}</Text>
            {invoice.due_date ? <Text>Fällig bis: {formatDate(invoice.due_date)}</Text> : null}
          </View>
        </View>

        <CustomerBlock customer={customer} />

        <LineItemsTable items={lineItems} />
        <TotalsBlock subtotal={invoice.subtotal} taxTotal={invoice.tax_total} total={invoice.total} />

        {invoice.notes ? <Text style={styles.notes}>{invoice.notes}</Text> : null}
        {company.iban ? (
          <Text style={styles.notes}>
            Bitte überweisen Sie den Rechnungsbetrag bis zum {formatDate(invoice.due_date)} auf folgendes Konto: IBAN{" "}
            {company.iban}
            {company.bic ? `, BIC ${company.bic}` : ""}.
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}
