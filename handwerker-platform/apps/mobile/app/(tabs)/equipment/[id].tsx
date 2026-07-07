import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { checkInEquipment, checkOutEquipment, getEquipmentBookings, getEquipmentById } from "@handwerker/api-client";
import type { Equipment, EquipmentBooking } from "@handwerker/shared-types";
import { supabase } from "@/lib/supabase";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const STATUS_LABELS: Record<string, string> = {
  reserved: "Reserviert",
  checked_out: "Ausgegeben",
  returned: "Zurückgegeben",
  overdue: "Überfällig",
  cancelled: "Storniert",
};

export default function EquipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useCurrentProfile();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [bookings, setBookings] = useState<EquipmentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const [equipmentResult, bookingsResult] = await Promise.all([
      getEquipmentById(supabase, id),
      getEquipmentBookings(supabase, id),
    ]);
    setEquipment(equipmentResult);
    setBookings(bookingsResult);
    setIsLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleCheckOut(bookingId: string) {
    setIsUpdating(true);
    await checkOutEquipment(supabase, bookingId);
    await load();
    setIsUpdating(false);
  }

  async function handleCheckIn(bookingId: string) {
    setIsUpdating(true);
    await checkInEquipment(supabase, bookingId);
    await load();
    setIsUpdating(false);
  }

  if (isLoading || !equipment) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const myBookings = bookings.filter((b) => b.assigned_to === profile?.id && (b.status === "reserved" || b.status === "checked_out"));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{equipment.name}</Text>
      <Text style={styles.category}>{equipment.category}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meine Buchungen</Text>
        {myBookings.length === 0 ? <Text style={styles.muted}>Keine eigenen Buchungen für dieses Gerät</Text> : null}
        {myBookings.map((booking) => (
          <View key={booking.id} style={styles.bookingRow}>
            <Text style={styles.bookingStatus}>{STATUS_LABELS[booking.status]}</Text>
            {booking.status === "reserved" ? (
              <Pressable style={styles.actionButton} disabled={isUpdating} onPress={() => handleCheckOut(booking.id)}>
                <Text style={styles.actionButtonText}>Ausgeben</Text>
              </Pressable>
            ) : null}
            {booking.status === "checked_out" ? (
              <Pressable style={styles.actionButton} disabled={isUpdating} onPress={() => handleCheckIn(booking.id)}>
                <Text style={styles.actionButtonText}>Rückgabe erfassen</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 16, gap: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  category: { fontSize: 14, color: "#6b7280" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600" },
  muted: { fontSize: 13, color: "#9ca3af" },
  bookingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12 },
  bookingStatus: { fontSize: 13, color: "#111827" },
  actionButton: { backgroundColor: "#111827", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  actionButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
