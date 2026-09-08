import {
  View,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { CommonActions } from "@react-navigation/native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useTheme } from "../core/theme/ThemeContext";

import ActiveAnalyticsIcon from "../assets/icons/active_analytics_tab.svg";
import InactiveAnalyticsIcon from "../assets/icons/non_active_analytics.svg";

// TEMPORARY: no dedicated Profile icon exists in assets/icons yet, so both
// states fall back to the Home icon just so the app compiles and runs.
// Replace these two lines once real active_profile_tab.svg /
// non_active_profile_tab.svg files are added to assets/icons.
import ActiveProfileIcon from "../assets/icons/active_home_tab.svg";
import InactiveProfileIcon from "../assets/icons/active_home_tab.svg";

const TAB_ICONS = {
  Analytics: {
    active: ActiveAnalyticsIcon,
    inactive: InactiveAnalyticsIcon,
  },
  Profile: {
    active: ActiveProfileIcon,
    inactive: InactiveProfileIcon,
  },
};

export default function BottomTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: "transparent",
            borderColor: colors.border,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const icons = TAB_ICONS[
            route.name as keyof typeof TAB_ICONS
          ];

          const Icon = isFocused
            ? icons?.active
            : icons?.inactive;

          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.dispatch({
                ...CommonActions.navigate(
                  route.name,
                  route.params
                ),
                target: state.key,
              });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? route.name
              }
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.pressed,
              ]}
            >
              {Icon && (
                <Icon
                  width={24}
                  height={24}
                />
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
    // مهم جداً على أندرويد
    elevation: 0,
    shadowOpacity: 0,
  },

  container: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
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