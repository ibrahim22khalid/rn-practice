import { Pressable, View, Text, StyleSheet, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../theme/ThemeContext";
import { getTextStyles } from "../values/textStyles";
import { Spacing } from "../values/spacing";

interface ListRowProps {
  /** Leading element — these icon assets are already fully composed
   * (their own colored badge/background baked into the .svg), so this is
   * rendered as-is with no extra wrapper box behind it. */
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  /** Trailing element — a chevron icon, a heart icon, a badge, etc. */
  trailing?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  style,
}: ListRowProps) {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress ? styles.pressed : null,
        style,
      ]}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}

      <View style={styles.textColumn}>
        <Text style={textStyles.body}>{title}</Text>
        {subtitle && (
          <Text style={[textStyles.caption, styles.subtitle]}>{subtitle}</Text>
        )}
      </View>

      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrap: {
    // No background/border-radius here on purpose — each icon asset is
    // already a complete graphic (its own badge shape and color baked in
    // for Edit Profile, Recovery Code, Support Pure Path, Talk to Rafiq,
    // Amanah Access...), so this is spacing-only, not a container.
    marginRight: Spacing.md,
  },
  textColumn: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  trailing: {
    marginLeft: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});