import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const ROLE_LABELS: Record<string, string> = { owner: "Owner", admin: "Admin", employee: "Mitarbeiter" };

export default function ProfileScreen() {
  const { profile } = useCurrentProfile();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{profile?.full_name ?? "—"}</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <Text style={styles.role}>{profile ? ROLE_LABELS[profile.role] : ""}</Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Abmelden</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  name: { fontSize: 18, fontWeight: "700" },
  email: { fontSize: 14, color: "#6b7280" },
  role: { fontSize: 13, color: "#9ca3af", marginBottom: 24 },
  button: { backgroundColor: "#111827", borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
