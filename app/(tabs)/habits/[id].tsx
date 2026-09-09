import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

import { useTheme } from "../../../src/core/theme/ThemeContext";
import { getTextStyles } from "../../../src/core/values/textStyles";
import { Spacing, Radius } from "../../../src/core/values/spacing";
import { useHabits } from "../../../src/features/habits/context/HabitsContext";
import Card from "../../../src/components/Card";
import Badge from "../../../src/components/Badge";
import AppButton from "../../../src/components/AppButton";

// HabitDetailScreen: shows one habit's details (streak, frequency, a
// 7-day grid) plus a "Mark as done / Mark as not done" button that flips
// doneToday in the context and returns to the list, whose count updates by
// derivation.
export default function HabitDetailScreen() {
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  
  const { habits, toggleDoneToday, toggleDayDone } = useHabits();
  
// Find the habit by id from the context. If not found, show a "not found" message.
  const habit = habits.find((h) => h.id === id);

  const handleToggle = () => {
    if (habit) {
      toggleDoneToday(habit.id);
      router.back();
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
      >
        {habit ? (
          <>
            <Text style={[textStyles.heading1, styles.title]}>
              {habit.name}
            </Text>
            <Card style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Streak</Text>
                <Text style={textStyles.body}>{habit.streak} day streak</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Frequency</Text>
                <Badge variant={habit.frequency === "daily" ? "info" : "neutral"}>
                  <Text
                    style={[
                      textStyles.caption,
                      {
                        color:
                          habit.frequency === "daily"
                            ? colors.info
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {habit.frequency}
                  </Text>
                </Badge>
              </View>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Last seven days</Text>
                <View style={styles.sevenRow}>
                  {habit.lastSevenDays.map((done, index) => (
                    <Pressable
                      key={`${habit.id}-${index}`}
                      onPress={() => toggleDayDone(habit.id, index)}
                      style={[
                        styles.dayBox,
                        {
                          backgroundColor: done
                            ? colors.success
                            : colors.surfaceElevated,
                          borderColor: done ? colors.success : colors.border,
                        },
                      ]}
                      accessible={true}
                      focusable={true}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: done }}
                      accessibilityLabel={`Day ${index + 1}: ${
                        done ? "completed" : "not completed"
                      }`}
                    >
                      <Text
                        style={[
                          textStyles.caption,
                          {
                            color: done
                              ? colors.background
                              : colors.textDisabled,
                          },
                        ]}
                      >
                        {done ? "✓" : " "}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Card>

            <AppButton
              text={habit.doneToday ? "Mark as not done" : "Mark as done"}
              variant={habit.doneToday ? "secondary" : "primary"}
              onPress={handleToggle}
            />

            <AppButton
              text="Go Back"
              variant="secondary"
              onPress={() => router.back()}
            />
          </>
        ) : (
          <View style={styles.centered}>
            <Text style={[textStyles.heading2, { color: colors.textSecondary }]}>
              Habit not found
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  detailCard: {
    gap: Spacing.lg,
  },
  detailRow: {
    gap: Spacing.xs,
  },
  sevenRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  dayBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});