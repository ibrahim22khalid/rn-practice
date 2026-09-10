import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing, Radius } from "../../../shared/values/spacing";

type FilterOption = 'all' | 'done' | 'not_done'

interface HabitFilterProps {
  selected: FilterOption
  onChange: (filter: FilterOption) => void
}

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'done', label: 'Done today' },
  { key: 'not_done', label: 'Not done today' },
]

// HabitFilter: a row of chip filters (All / Done today / Not done today).
// The active chip is highlighted and tapping one reports the new filter via
// `onChange`, which the list screen uses to filter the FlatList.
export default function HabitFilter({ selected, onChange }: HabitFilterProps) {
  const { colors } = useTheme()
  const textStyles = getTextStyles(colors)

  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => {
        const isActive = selected === filter.key
        return (
          <Pressable
            key={filter.key}
            onPress={() => onChange(filter.key)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                textStyles.caption,
                {
                  color: isActive ? colors.background : colors.textSecondary,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export type { FilterOption }

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
})
