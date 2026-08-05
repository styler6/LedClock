import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getProjectsForEmployee } from "@handwerker/api-client";
import type { Project } from "@handwerker/shared-types";
import { supabase } from "@/lib/supabase";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const STATUS_LABELS: Record<string, string> = {
  planned: "Geplant",
  in_progress: "In Bearbeitung",
  on_hold: "Pausiert",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

export default function JobsScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let cancelled = false;
      setIsLoading(true);
      getProjectsForEmployee(supabase, profile.id).then((result) => {
        if (!cancelled) {
          setProjects(result);
          setIsLoading(false);
        }
      });
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
    <FlatList
      data={projects}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>Ihnen sind aktuell keine Aufträge zugewiesen.</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/jobs/${item.id}`)}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardStatus}>{STATUS_LABELS[item.status]}</Text>
          {item.site_address_street ? <Text style={styles.cardAddress}>{item.site_address_street}</Text> : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 32 },
  card: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 16, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardStatus: { fontSize: 13, color: "#6b7280" },
  cardAddress: { fontSize: 13, color: "#6b7280" },
});
