import { Tabs } from "expo-router";
import { SettingsIcon, TrendingUpIcon, EyeIcon } from "lucide-react-native";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#699BF7",
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarStyle: {
          backgroundColor: "#1E2237", // DARK_NAVY from your palette
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="TopMoverScreen"
        options={{
          title: "Top Movers",
          tabBarIcon: ({ color, size }) => (
            <TrendingUpIcon color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="WatchListScreen"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, size }) => (
            <EyeIcon color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="SettingScreen"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
