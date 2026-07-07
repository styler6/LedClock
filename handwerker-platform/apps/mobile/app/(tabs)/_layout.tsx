import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="jobs/index" options={{ title: "Meine Aufträge" }} />
      <Tabs.Screen name="jobs/[id]" options={{ href: null, title: "Auftrag" }} />
      <Tabs.Screen name="equipment/index" options={{ title: "Geräte" }} />
      <Tabs.Screen name="equipment/[id]" options={{ href: null, title: "Gerät" }} />
      <Tabs.Screen name="documents/index" options={{ title: "Dokumente" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
