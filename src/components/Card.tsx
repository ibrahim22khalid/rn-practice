// Card.tsx
import { Text, View, StyleSheet } from "react-native";
import { useTheme } from "../core/theme/ThemeContext";
import { getTextStyles } from "../core/values/textStyles";

interface CardProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
}

export default function Card({ title, subtitle }: CardProps) {
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
      ]}
    >
      <Text style={textStyles.heading2}>{title}</Text>
      <Text style={textStyles.caption}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    // Base shadow properties; actual visibility is toggled via shadowOpacity/elevation above
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});