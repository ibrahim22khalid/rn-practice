import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../../shared/theme/ThemeContext";
import { Radius, Spacing } from "../../../shared/values/spacing";
import { getTextStyles } from "../../../shared/values/textStyles";

type QueryStatus = "pending" | "error" | "success";
type FetchStatus = "fetching" | "paused" | "idle";

type HabitQueryStatusPanelProps = Readonly<{
  status: QueryStatus;
  fetchStatus: FetchStatus;
  searchTerm: string;
  isOnline: boolean;
  isFocused: boolean;
  dataUpdatedAt: number;
}>;

// Displays development-only query, connectivity, focus, and freshness diagnostics.
export default function HabitQueryStatusPanel({
  status,
  fetchStatus,
  searchTerm,
  isOnline,
  isFocused,
  dataUpdatedAt,
}: HabitQueryStatusPanelProps) {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  if (!__DEV__) return null;

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={textStyles.overline}>Development query status</Text>
      <Text style={textStyles.caption}>status: {status}</Text>
      <Text style={textStyles.caption}>fetchStatus: {fetchStatus}</Text>
      <Text style={textStyles.caption}>
        search: {searchTerm || "(all habits)"}
      </Text>
      <Text style={textStyles.caption}>online: {String(isOnline)}</Text>
      <Text style={textStyles.caption}>focused: {String(isFocused)}</Text>
      <Text style={textStyles.caption}>
        updatedAt: {dataUpdatedAt || "never"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
});
