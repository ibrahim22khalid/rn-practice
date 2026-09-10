import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing } from "../../../shared/values/spacing";
import { useItems } from "../hooks/UseAnalytics";

import Card from "../../../shared/components/Card";
import Badge from "../../../shared/components/Badge";
import AppButton from "../../../shared/components/AppButton";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const { items } = useItems();

  // Find the item by id from the context. If not found, show a "not found" message.
  const item = items.find((i) => i.id === id);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        {item ? (
          <>
            <Text style={[textStyles.heading1, styles.title]}>{item.name}</Text>
            <Card style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Category</Text>
                <Text style={textStyles.body}>{item.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Days on Path</Text>
                <Text style={textStyles.body}>{item.daysOnPath}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Status</Text>
                <Badge variant={item.streakActive ? "success" : "neutral"}>
                  <Text
                    style={[
                      textStyles.caption,
                      {
                        color: item.streakActive
                          ? colors.success
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {item.streakActive ? "Active" : "Paused"}
                  </Text>
                </Badge>
              </View>
            </Card>
          </>
        ) : (
          <View style={styles.centered}>
            <Text style={[textStyles.heading2, { color: colors.textSecondary }]}>
              not found
            </Text>
          </View>
        )}

        <AppButton
          text="Go Back"
          variant="secondary"
          onPress={() => router.back()}
        />
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
