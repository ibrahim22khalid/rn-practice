import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing, Radius } from "../../../shared/values/spacing";
import Card from "../../../shared/components/Card";
import Badge from "../../../shared/components/Badge";
import { Habit } from '../types/habit'

interface HabitCardProps {
  habit: Habit
  onPress: () => void
}

// HabitCard: a single row in the habits list — the habit name, a
// Done/Pending badge (driven by doneToday), streak and frequency. Wrapped in
// a Pressable that navigates to the habit's detail screen.
export default function HabitCard({ habit, onPress }: HabitCardProps) {
  const { colors } = useTheme()
  const textStyles = getTextStyles(colors)

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={textStyles.body}>{habit.name}</Text>
          <Badge variant={habit.doneToday ? 'success' : 'neutral'}>
            <Text
              style={[
                textStyles.caption,
                { color: habit.doneToday ? colors.success : colors.textSecondary },
              ]}
            >
              {habit.doneToday ? 'Done' : 'Pending'}
            </Text>
          </Badge>
        </View>
        <View style={styles.meta}>
          <Text style={textStyles.caption}>
            {habit.streak} day streak
          </Text>
          <Text style={textStyles.caption}>
            {habit.frequency}
          </Text>
        </View>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  card: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
