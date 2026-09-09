import { Pressable, StyleSheet, View } from "react-native";
import { useRouter, usePathname } from "expo-router";

import { useTheme } from "../core/theme/ThemeContext";

import ActiveAnalyticsIcon from "../assets/icons/active_analytics_tab.svg";
import InactiveAnalyticsIcon from "../assets/icons/non_active_analytics.svg";

import ActiveProfileIcon from "../assets/icons/active_home_tab.svg";
import InactiveProfileIcon from "../assets/icons/active_home_tab.svg";

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
];

export default function BottomTabBar() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isAnalyticsActive =
    pathname.startsWith("/(tabs)/analytics") || pathname === "/analytics";
  const isProfileActive =
    pathname.startsWith("/(tabs)/profile") || pathname === "/profile";

  const isFocused = (name: string) => {
    if (name === "analytics") return isAnalyticsActive;
    if (name === "profile") return isProfileActive;
    return false;
  };

  return (
    <View style={[styles.wrapper, { bottom: 16 }]}>
      <View style={[styles.container, { borderColor: colors.border }]}>
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
