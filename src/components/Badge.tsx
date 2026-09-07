import { View, StyleSheet, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../core/theme/ThemeContext";

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
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
});