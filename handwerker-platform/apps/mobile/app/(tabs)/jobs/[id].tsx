import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Linking, Alert } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getEquipmentBookingsForProject, getProject, updateProjectStatus } from "@handwerker/api-client";
import type { EquipmentBooking, Project, ProjectStatus } from "@handwerker/shared-types";
import { supabase } from "@/lib/supabase";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const STATUS_FLOW: { status: ProjectStatus; label: string }[] = [
  { status: "planned", label: "Geplant" },
  { status: "in_progress", label: "In Bearbeitung" },
  { status: "on_hold", label: "Pausiert" },
  { status: "completed", label: "Abgeschlossen" },
];

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useCurrentProfile();
  const [project, setProject] = useState<Project | null>(null);
  const [bookings, setBookings] = useState<EquipmentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const [projectResult, bookingsResult] = await Promise.all([
      getProject(supabase, id),
      getEquipmentBookingsForProject(supabase, id),
    ]);
    setProject(projectResult);
    setBookings(bookingsResult);
    setIsLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function changeStatus(status: ProjectStatus) {
    if (!project || !profile) return;
    await updateProjectStatus(supabase, project.id, status, profile.id);
    load();
  }

  async function capturePhoto() {
    if (!project) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Kamera-Zugriff erforderlich", "Bitte erlauben Sie den Kamera-Zugriff, um Fotos aufzunehmen.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    setIsUploading(true);
    try {
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const path = `${project.company_id}/${project.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("project-photos").upload(path, blob, { contentType: "image/jpeg" });
      if (error) Alert.alert("Upload fehlgeschlagen", error.message);
    } finally {
      setIsUploading(false);
    }
  }

  function openInMaps() {
    if (!project?.site_address_street) return;
    const query = encodeURIComponent(
      `${project.site_address_street}, ${project.site_address_zip ?? ""} ${project.site_address_city ?? ""}`,
    );
    Linking.openURL(`https://maps.apple.com/?q=${query}`);
  }

  if (isLoading || !project) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{project.name}</Text>
      {project.description ? <Text style={styles.description}>{project.description}</Text> : null}

      {project.site_address_street ? (
        <Pressable onPress={openInMaps}>
          <Text style={styles.address}>
            📍 {project.site_address_street}, {project.site_address_zip} {project.site_address_city}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_FLOW.map((s) => (
            <Pressable
              key={s.status}
              onPress={() => changeStatus(s.status)}
              style={[styles.statusButton, project.status === s.status && styles.statusButtonActive]}
            >
              <Text style={[styles.statusButtonText, project.status === s.status && styles.statusButtonTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geräte auf dieser Baustelle</Text>
        {bookings.length === 0 ? <Text style={styles.muted}>Keine Geräte zugeordnet</Text> : null}
        {bookings.map((booking) => (
          <Text key={booking.id} style={styles.muted}>
            {booking.equipment_id} — {booking.status}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fotos</Text>
        <Pressable style={styles.photoButton} onPress={capturePhoto} disabled={isUploading}>
          {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.photoButtonText}>📷 Foto aufnehmen</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 16, gap: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  description: { fontSize: 14, color: "#4b5563" },
  address: { fontSize: 14, color: "#2563eb" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600" },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusButton: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  statusButtonActive: { backgroundColor: "#111827", borderColor: "#111827" },
  statusButtonText: { fontSize: 13, color: "#111827" },
  statusButtonTextActive: { color: "#fff" },
  muted: { fontSize: 13, color: "#9ca3af" },
  photoButton: { backgroundColor: "#111827", borderRadius: 8, padding: 12, alignItems: "center" },
  photoButtonText: { color: "#fff", fontWeight: "600" },
});
