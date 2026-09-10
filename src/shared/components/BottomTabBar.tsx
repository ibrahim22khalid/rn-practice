import { Pressable, StyleSheet, View } from "react-native";
import { useRouter, usePathname } from "expo-router";

import { useTheme } from "../theme/ThemeContext";

// BottomTabBar: custom floating tab bar rendered above the expo-router Tabs.
// It watches usePathname() to decide which of the three tabs is active (a
// path like /habits/1 still counts as the Habits tab), and router.push() to
// switch tabs when tapped.
import ActiveAnalyticsIcon from "../../assets/icons/active_analytics_tab.svg";
import InactiveAnalyticsIcon from "../../assets/icons/non_active_analytics.svg";

import ActiveProfileIcon from "../../assets/icons/active_home_tab.svg";
import InactiveProfileIcon from "../../assets/icons/non_active_home_tab.svg";

import ActiveHabitsIcon from "../../assets/icons/active_habits_tab.svg";
import InactiveHabitsIcon from "../../assets/icons/non_active_habits_tab.svg";

type TabConfig = {
  name: string;
  href: string;
  activeIcon: React.ComponentType<any>;
  inactiveIcon: React.ComponentType<any>;
};

const TABS: TabConfig[] = [
  {
    name: "analytics",
    href: "/(tabs)/analytics",
    activeIcon: ActiveAnalyticsIcon,
    inactiveIcon: InactiveAnalyticsIcon,
  },
  {
    name: "profile",
    href: "/(tabs)/profile",
    activeIcon: ActiveProfileIcon,
    inactiveIcon: InactiveProfileIcon,
  },
  {
    name: "habits",
    href: "/(tabs)/habits",
    activeIcon: ActiveHabitsIcon,
    inactiveIcon: InactiveHabitsIcon,
  },
];

export default function BottomTabBar() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isAnalyticsActive = pathname.startsWith("/analytics");
  const isProfileActive = pathname.startsWith("/profile");
  const isHabitsActive = pathname.startsWith("/habits");

  const isFocused = (name: string) => {
    if (name === "analytics") return isAnalyticsActive;
    if (name === "profile") return isProfileActive;
    if (name === "habits") return isHabitsActive;
    return false;
  };

  return (
    <View style={[styles.wrapper, { bottom: 16 }]}>
      <View style={[styles.container, { borderColor: "transparent" }]}>
        {TABS.map((tab) => {
          const focused = isFocused(tab.name);
          const Icon = focused ? tab.activeIcon : tab.inactiveIcon;

          return (
            <Pressable
              key={tab.name}
              onPress={() => router.push(tab.href as any)}
              style={styles.tab}
            >
              {({ pressed }) => (
                <View style={pressed && styles.pressed}>
                  <Icon width={24} height={24} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.6,
  },
});
