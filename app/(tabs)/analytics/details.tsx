import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { useTheme } from "../../../src/core/theme/ThemeContext";
import { getTextStyles } from "../../../src/core/values/textStyles";
import { Spacing, Radius } from "../../../src/core/values/spacing";
import { useItems, PurePathItem } from "../../../src/data/itemsContext";

import Card from "../../../src/components/Card";
import Badge from "../../../src/components/Badge";
import AppButton from "../../../src/components/AppButton";

export default function DetailsScreen() {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const { items } = useItems();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }: { item: PurePathItem }) => (
    <Pressable
      onPress={() => router.push(`/(tabs)/analytics/${item.id}`)}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.pressed,
      ]}
    >
      <Card style={styles.rowCard}>
        <View style={styles.rowHeader}>
          <Text style={textStyles.body}>{item.name}</Text>
          <Badge variant={item.streakActive ? "success" : "neutral"}>
            <Text
              style={[
                textStyles.caption,
                { color: item.streakActive ? colors.success : colors.textSecondary },
              ]}
            >
              {item.streakActive ? "Active" : "Paused"}
            </Text>
          </Badge>
        </View>
        <View style={styles.rowMeta}>
          <Text style={textStyles.caption}>{item.category}</Text>
          <Text style={textStyles.caption}>{item.daysOnPath} days</Text>
        </View>
      </Card>
    </Pressable>
  );

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
        <Text style={[textStyles.heading1, styles.title]}>
          Analytics Details
        </Text>

        <AppButton
          text="Add Item"
          variant="secondary"
          onPress={() => router.push("/(tabs)/analytics/form")}
        />

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centered}>
            <Text style={[textStyles.heading2, { color: colors.textSecondary }]}>
              No items found
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
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
  },
  title: {
    marginBottom: Spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  row: {
    marginBottom: Spacing.sm,
  },
  rowCard: {
    padding: Spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  rowMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
