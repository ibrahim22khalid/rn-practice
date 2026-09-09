import { View, StyleSheet, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../core/theme/ThemeContext";
import { Spacing, Radius } from "../core/values/spacing";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

// Badge: a small pill-shaped tag. The variant picks the accent color
// (success/warning/error/info/neutral); the text label is whatever children
// you pass (usually a colored Text or an icon + Text).
export default function Badge({
  children,
  variant = "neutral",
  style,
}: BadgeProps) {
  const { colors } = useTheme();

  const variantColors: Record<BadgeVariant, string> = {
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    neutral: colors.textSecondary,
  };

  const backgroundColor = variantColors[variant];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: `${backgroundColor}20` },
        { borderColor: backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});