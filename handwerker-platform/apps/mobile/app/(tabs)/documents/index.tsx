import { useCallback, useState } from "react";
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { getInvoices, getProjectsForEmployee, getQuotes } from "@handwerker/api-client";
import type { Invoice, Quote } from "@handwerker/shared-types";
import { supabase } from "@/lib/supabase";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export default function DocumentsScreen() {
  const { profile } = useCurrentProfile();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let cancelled = false;
      setIsLoading(true);
      Promise.all([getProjectsForEmployee(supabase, profile.id), getQuotes(supabase), getInvoices(supabase)]).then(
        ([myProjects, allQuotes, allInvoices]) => {
          if (cancelled) return;
          const projectIds = new Set(myProjects.map((p) => p.id));
          setQuotes(allQuotes.filter((q) => q.project_id && projectIds.has(q.project_id)));
          setInvoices(allInvoices.filter((i) => i.project_id && projectIds.has(i.project_id)));
          setIsLoading(false);
        },
      );
      return () => {
        cancelled = true;
      };
    }, [profile]),
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SectionList
      contentContainerStyle={styles.list}
      sections={[
        { title: "Angebote", data: quotes.map((q) => ({ id: q.id, label: q.quote_number, total: q.total })) },
        { title: "Rechnungen", data: invoices.map((i) => ({ id: i.id, label: i.invoice_number, total: i.total })) },
      ]}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.total}>{formatCurrency(item.total)}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Keine Dokumente für Ihre Projekte gefunden.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginTop: 16, marginBottom: 8, color: "#6b7280" },
  row: { flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12, marginBottom: 8 },
  label: { fontWeight: "600" },
  total: { color: "#4b5563" },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 32 },
});
