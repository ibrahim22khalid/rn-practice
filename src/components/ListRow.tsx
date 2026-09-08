import { Pressable, View, Text, StyleSheet, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../core/theme/ThemeContext";
import { getTextStyles } from "../core/values/textStyles";
import { Spacing, Radius } from "../core/values/spacing";

interface ListRowProps {
  /** Leading icon element, e.g. an imported .svg component instance. */
  icon?: ReactNode;
  /** Background tint behind the icon (defaults to theme surfaceElevated). */
  iconBackground?: string;
  title: string;
  subtitle?: string;
  /** Trailing element — a chevron icon, a heart icon, a badge, etc. */
  trailing?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function ListRow({
  icon,
  iconBackground,
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
      {icon && (
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: iconBackground ?? colors.surfaceElevated },
          ]}
        >
          {icon}
        </View>
      )}

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
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
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