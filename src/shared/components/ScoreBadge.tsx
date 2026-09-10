import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { getTextStyles } from "../values/textStyles";

interface ScoreBadgeProps {
  value: number;
  color: string;
  size?: number;
}

export default function ScoreBadge({ value, color, size = 40 }: ScoreBadgeProps) {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
      ]}
    >
      <Text style={[textStyles.caption, styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontWeight: "700",
  },
});