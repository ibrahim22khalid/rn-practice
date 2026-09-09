import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../core/theme/ThemeContext";
import { getTextStyles } from "../core/values/textStyles";
import { Spacing, Radius } from "../core/values/spacing";

interface MilestoneCircleProps {
  day: number;
  /** Whether this milestone has already been reached. Defaults to false —
   * all circles render in the muted/unreached state, matching the reference
   * (0 day streak, so no milestone has been hit yet). */
  reached?: boolean;
}

// MilestoneCircle: one milestone marker in the profile — a numbered circle
// (e.g. Day 1, Day 7) with a label below. `reached` switches to the primary
// color; by default all milestones render unreached.
export default function MilestoneCircle({
  day,
  reached = false,
}: MilestoneCircleProps) {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.circle,
          {
            backgroundColor: reached ? colors.primary : colors.surface,
            borderColor: reached ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            textStyles.body,
            { color: reached ? colors.background : colors.textPrimary },
          ]}
        >
          {day}
        </Text>
      </View>
      <Text style={[textStyles.caption, styles.label]}>Day {day}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: Spacing.xs,
  },
});