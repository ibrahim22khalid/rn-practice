import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { ReactNode } from "react";
import Card from "./Card";
import { useTheme } from "../core/theme/ThemeContext";
import { getTextStyles } from "../core/values/textStyles";
import { Spacing } from "../core/values/spacing";

interface StatTileProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  style?: ViewStyle;
}

export default function StatTile({ icon, value, label, style }: StatTileProps) {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  // Card's `style` prop is typed as a single ViewStyle rather than
  // StyleProp<ViewStyle>, so merge here instead of passing an array.
  const mergedCardStyle: ViewStyle = { ...styles.card, ...style };

  return (
    <Card style={mergedCardStyle}>
      <View style={styles.iconRow}>{icon}</View>
      <Text style={textStyles.heading2}>{value}</Text>
      <Text style={textStyles.caption}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
  },
  iconRow: {
    marginBottom: Spacing.xs,
  },
});