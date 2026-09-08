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
    // Fixed: was a hardcoded 4 — now pulled from the tokens file (Spacing.xs === 4)
    paddingVertical: Spacing.xs,
    // Fixed: was a hardcoded 10, which matched no entry in the Spacing scale
    paddingHorizontal: Spacing.sm,
    // Fixed: was a hardcoded 999 — now pulled from the tokens file (Radius.full === 999)
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});