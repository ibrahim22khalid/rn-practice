// BottomTabBar.tsx
import { Pressable, StyleSheet, View } from "react-native";
import { TabTrigger } from "expo-router/ui";

import { useTheme } from "../core/theme/ThemeContext";

import ActiveAnalyticsIcon from "../assets/icons/active_analytics_tab.svg";
import InactiveAnalyticsIcon from "../assets/icons/non_active_analytics.svg";

import ActiveProfileIcon from "../assets/icons/active_home_tab.svg";
// import InactiveProfileIcon from "../assets/icons/non_active_home_tab.svg";

type CustomTabButtonProps = {
  isFocused?: boolean;
  onPress?: () => void;
  activeIcon: React.ComponentType<any>;
  inactiveIcon: React.ComponentType<any>;
};

function CustomTabButton({
  isFocused,
  onPress,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
}: CustomTabButtonProps) {
  const Icon = isFocused ? ActiveIcon : InactiveIcon;

  return (
    <Pressable onPress={onPress} style={styles.tab}>
      {({ pressed }) => (
        <View style={pressed && styles.pressed}>
          <Icon width={24} height={24} />
        </View>
      )}
    </Pressable>
  );
}

type CustomTabProps = {
  name: string;
  href: string;
  activeIcon: React.ComponentType<any>;
  inactiveIcon: React.ComponentType<any>;
};

function CustomTab({ name, href, activeIcon, inactiveIcon }: CustomTabProps) {
  return (
    <TabTrigger name={name} href={href} asChild>
      <CustomTabButton activeIcon={activeIcon} inactiveIcon={inactiveIcon} />
    </TabTrigger>
  );
}

export default function BottomTabBar() {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { bottom: 16 }]}>
      <View style={[styles.container, { borderColor: colors.border }]}>
        <CustomTab
          name="analytics"
          href="/analytics"
          activeIcon={ActiveAnalyticsIcon}
          inactiveIcon={InactiveAnalyticsIcon}
        />
        <CustomTab
          name="profile"
          href="/profile"
          activeIcon={ActiveProfileIcon}
          inactiveIcon={ActiveProfileIcon}
        />
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