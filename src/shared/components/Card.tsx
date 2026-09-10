// Card.tsx
import { Text, View, Image, StyleSheet, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../theme/ThemeContext";
import { getTextStyles } from "../values/textStyles";
import { Spacing, Radius } from "../values/spacing";

interface CardProps {
  // Made optional: Card no longer forces the title/subtitle text layout —
  // omit both and pass `children` instead to use Card as a plain container
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  // New: lets Card wrap arbitrary content (progress rings, charts, list
  // rows, stat rows) instead of being locked to title/subtitle text only
  children?: ReactNode;
  // New: lets the parent control spacing (e.g. marginBottom between cards)
  // from the layout that places the Card, without hardcoding it inside Card
  style?: ViewStyle;
}

export default function Card({
  title,
  subtitle,
  imageUrl,
  children,
  style,
}: CardProps) {
  const { colors, isDark } = useTheme();
  const textStyles = getTextStyles(colors);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          // Shadows read as a dark smudge on a dark background, so keep the
          // container flat in dark mode and only cast a shadow in light mode
          shadowOpacity: isDark ? 0 : 0.08,
          elevation: isDark ? 0 : 2,
        },
        style,
      ]}
    >
      {/* imageUrl was declared but never rendered before — now actually used */}
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
      {title && <Text style={textStyles.heading2}>{title}</Text>}
      {subtitle && <Text style={textStyles.caption}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    // Fixed: was a hardcoded 12, which matched no entry in the Radius scale
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    // Base shadow properties; actual visibility is toggled via shadowOpacity/elevation above
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
});