import { View, Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { getTextStyles } from "../values/textStyles";
import { Spacing, Radius } from "../values/spacing";

interface SegmentedTabsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function SegmentedTabs({
  options,
  value,
  onChange,
}: SegmentedTabsProps) {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {options.map((option) => {
        const isActive = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.tab,
              isActive && { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Text
              style={[
                textStyles.body,
                { color: isActive ? colors.textPrimary : colors.textSecondary },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
});