import { Pressable, StyleSheet, View } from "react-native";
import { useRouter, usePathname } from "expo-router";
import type { Href } from "expo-router";
import type { ComponentType } from "react";

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
  name: "analytics" | "profile" | "habits" | "payment";
  href: Href;
  activeIcon: ComponentType<TabIconProps>;
  inactiveIcon: ComponentType<TabIconProps>;
};

type TabIconProps = {
  width: number;
  height: number;
};

function PaymentTabIcon({
  width,
  height,
  active,
}: TabIconProps & { active: boolean }) {
  const { colors } = useTheme();
  const iconColor = active ? colors.primary : colors.textSecondary;

  return (
    <View
      style={[
        styles.paymentIcon,
        {
          width,
          height: height * 0.72,
          borderColor: iconColor,
          backgroundColor: active ? iconColor : "transparent",
        },
      ]}
    >
      <View
        style={[
          styles.paymentIconStripe,
          {
            backgroundColor: active ? colors.background : iconColor,
          },
        ]}
      />
    </View>
  );
}

function ActivePaymentIcon(props: TabIconProps) {
  return <PaymentTabIcon {...props} active />;
}

function InactivePaymentIcon(props: TabIconProps) {
  return <PaymentTabIcon {...props} active={false} />;
}

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
  {
    name: "payment",
    href: "/(tabs)/payment",
    activeIcon: ActivePaymentIcon,
    inactiveIcon: InactivePaymentIcon,
  },
];

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isFocused = (name: TabConfig["name"]) =>
    pathname.startsWith(`/${name}`);

  return (
    <View style={[styles.wrapper, { bottom: 16 }]}>
      <View style={[styles.container, { borderColor: "transparent" }]}>
        {TABS.map((tab) => {
          const focused = isFocused(tab.name);
          const Icon = focused ? tab.activeIcon : tab.inactiveIcon;

          return (
            <Pressable
              key={tab.name}
              onPress={() => router.push(tab.href)}
              accessibilityRole="button"
              accessibilityLabel={`${tab.name} tab`}
              accessibilityState={{ selected: focused }}
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
  paymentIcon: {
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 3,
  },
  paymentIconStripe: {
    width: "100%",
    height: 2,
  },
});
