import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Company, Customer } from "@handwerker/shared-types";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  companyBlock: {
    maxWidth: 260,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  metaBlock: {
    textAlign: "right",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  customerBlock: {
    marginBottom: 24,
  },
  table: {
    marginTop: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 6,
    fontWeight: 700,
  },
  colDescription: { flex: 4 },
  colQuantity: { flex: 1, textAlign: "right" },
  colUnit: { flex: 1, textAlign: "right" },
  colUnitPrice: { flex: 1.5, textAlign: "right" },
  colLineTotal: { flex: 1.5, textAlign: "right" },
  totalsBlock: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    fontWeight: 700,
  },
  notes: {
    marginTop: 24,
    fontSize: 9,
    color: "#444",
  },
});

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("de-DE").format(new Date(value));
}

export function CompanyHeader({ company }: { company: Company }) {
  return (
    <View style={styles.companyBlock}>
      <Text style={styles.companyName}>{company.name}</Text>
      {company.address_street ? <Text>{company.address_street}</Text> : null}
      {(company.address_zip || company.address_city) && (
        <Text>
          {company.address_zip} {company.address_city}
        </Text>
      )}
      {company.tax_id ? <Text>Steuernummer: {company.tax_id}</Text> : null}
      {company.vat_id ? <Text>USt-IdNr.: {company.vat_id}</Text> : null}
    </View>
  );
}

export function CustomerBlock({ customer }: { customer: Customer }) {
  return (
    <View style={styles.customerBlock}>
      <Text>{customer.name}</Text>
      {customer.contact_person ? <Text>z. Hd. {customer.contact_person}</Text> : null}
      {customer.address_street ? <Text>{customer.address_street}</Text> : null}
      {(customer.address_zip || customer.address_city) && (
        <Text>
          {customer.address_zip} {customer.address_city}
        </Text>
      )}
    </View>
  );
}

export interface PdfLineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
}

export function LineItemsTable({ items }: { items: PdfLineItem[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        <Text style={styles.colDescription}>Beschreibung</Text>
        <Text style={styles.colQuantity}>Menge</Text>
        <Text style={styles.colUnit}>Einheit</Text>
        <Text style={styles.colUnitPrice}>Einzelpreis</Text>
        <Text style={styles.colLineTotal}>Gesamt</Text>
      </View>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key -- line items have no stable client-side id here
        <View style={styles.tableRow} key={index}>
          <Text style={styles.colDescription}>{item.description}</Text>
          <Text style={styles.colQuantity}>{item.quantity}</Text>
          <Text style={styles.colUnit}>{item.unit}</Text>
          <Text style={styles.colUnitPrice}>{formatCurrency(item.unit_price)}</Text>
          <Text style={styles.colLineTotal}>{formatCurrency(item.line_total)}</Text>
        </View>
      ))}
    </View>
  );
}

export function TotalsBlock({ subtotal, taxTotal, total }: { subtotal: number; taxTotal: number; total: number }) {
  return (
    <View style={styles.totalsBlock}>
      <View style={styles.totalsRow}>
        <Text>Zwischensumme</Text>
        <Text>{formatCurrency(subtotal)}</Text>
      </View>
      <View style={styles.totalsRow}>
        <Text>MwSt.</Text>
        <Text>{formatCurrency(taxTotal)}</Text>
      </View>
      <View style={styles.totalsRowFinal}>
        <Text>Gesamt</Text>
        <Text>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
}
