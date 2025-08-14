import { Tabs } from "expo-router";
import { SettingsIcon, TrendingUpIcon, EyeIcon } from "lucide-react-native";
import { View, Text, StyleSheet } from "react-native";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#000000",
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          paddingVertical: 20,
        },
        tabBarStyle: {
          borderTopWidth: 2,
          borderColor: "#000000",
          height: 100,
          alignItems: "center",
          justifyContent: "center",
          elevation: 0, // Remove Android shadow
          shadowOpacity: 0, // Remove iOS shadow
        },
      }}
    >
      <Tabs.Screen
        name="TopMoverScreen"
        options={{
          title: "Top Movers",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <TrendingUpIcon
                color={focused ? "#FFFFFF" : "#000000"}
                size={20}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="WatchListScreen"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <EyeIcon color={focused ? "#FFFFFF" : "#000000"} size={20} />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="SettingScreen"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <SettingsIcon color={focused ? "#FFFFFF" : "#000000"} size={20} />
            </View>
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    backgroundColor: "#F8F9FF",
    borderWidth: 3,
    borderColor: "#000000",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "3px 2px 0px #000",
    borderRadius: 5,
  },
  iconWrapperActive: {
    backgroundColor: "rgb(0, 0, 0)",
  },
});
