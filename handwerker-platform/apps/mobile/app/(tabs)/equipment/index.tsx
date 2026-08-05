import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getBookingsAssignedTo, getEquipmentCatalog } from "@handwerker/api-client";
import type { Equipment } from "@handwerker/shared-types";
import { supabase } from "@/lib/supabase";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const STATUS_LABELS: Record<string, string> = {
  available: "Verfügbar",
  booked: "Gebucht",
  in_use: "Im Einsatz",
  maintenance: "Wartung",
  retired: "Ausgemustert",
};

export default function EquipmentScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [mineIds, setMineIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let cancelled = false;
      setIsLoading(true);
      Promise.all([getEquipmentCatalog(supabase), getBookingsAssignedTo(supabase, profile.id)]).then(
        ([catalog, bookings]) => {
          if (cancelled) return;
          setEquipment(catalog);
          setMineIds(new Set(bookings.map((b) => b.equipment_id)));
          setIsLoading(false);
        },
      );
      return () => {
        cancelled = true;
      };
    }, [profile]),
  );

  const visibleEquipment = filter === "mine" ? equipment.filter((e) => mineIds.has(e.id)) : equipment;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, filter === "all" && styles.tabActive]} onPress={() => setFilter("all")}>
          <Text style={[styles.tabText, filter === "all" && styles.tabTextActive]}>Alle</Text>
        </Pressable>
        <Pressable style={[styles.tab, filter === "mine" && styles.tabActive]} onPress={() => setFilter("mine")}>
          <Text style={[styles.tabText, filter === "mine" && styles.tabTextActive]}>Bei mir</Text>
        </Pressable>
      </View>
      <FlatList
        data={visibleEquipment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Keine Geräte gefunden.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/equipment/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardStatus}>{STATUS_LABELS[item.status]}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1 },
  tabRow: { flexDirection: "row", padding: 16, gap: 8 },
  tab: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db", paddingVertical: 8, alignItems: "center" },
  tabActive: { backgroundColor: "#111827", borderColor: "#111827" },
  tabText: { color: "#111827", fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  list: { padding: 16, paddingTop: 0, gap: 12 },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 32 },
  card: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 16, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardStatus: { fontSize: 13, color: "#6b7280" },
});
