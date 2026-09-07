import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";

import Card from "../components/Card";
import AppButton from "../components/AppButton";
import Badge from "../components/Badge";
import { useTheme } from "../core/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  badgeVariant: "success" | "warning" | "error";
  badgeLabel: string;
}

const items: CardItem[] = [
  {
    id: "1",
    title: "طلب #1024",
    subtitle: "تم التسليم بنجاح",
    badgeVariant: "success",
    badgeLabel: "مكتمل",
  },
  {
    id: "2",
    title: "طلب #1025",
    subtitle: "في انتظار التأكيد",
    badgeVariant: "warning",
    badgeLabel: "معلّق",
  },
  {
    id: "3",
    title: "طلب #1026",
    subtitle: "تم الإلغاء من العميل",
    badgeVariant: "error",
    badgeLabel: "ملغي",
  },
];

export default function CardsScreen() {
  // mode/setMode pulled in alongside colors so the temporary test toggle
  // below can force light/dark independently of the device's OS setting
  const { colors, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      {/* TEMPORARY: manual dark mode test toggle — remove once verified */}
      <View style={[styles.testToggleRow, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => setMode("light")}
          style={[
            styles.testToggleButton,
            {
              backgroundColor: mode === "light" ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={{
              color: mode === "light" ? colors.background : colors.textPrimary,
              fontWeight: "600",
            }}
          >
            Light
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("dark")}
          style={[
            styles.testToggleButton,
            {
              backgroundColor: mode === "dark" ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={{
              color: mode === "dark" ? colors.background : colors.textPrimary,
              fontWeight: "600",
            }}
          >
            Dark
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("system")}
          style={[
            styles.testToggleButton,
            {
              backgroundColor: mode === "system" ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={{
              color: mode === "system" ? colors.background : colors.textPrimary,
              fontWeight: "600",
            }}
          >
            Auto
          </Text>
        </Pressable>
      </View>

      {items.map((item) => (
        <View key={item.id}>
          <Card title={item.title} subtitle={item.subtitle} />
          <View style={styles.cardFooter}>
            <Badge variant={item.badgeVariant}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                {item.badgeLabel}
              </Text>
            </Badge>

            <AppButton
              text="عرض التفاصيل"
              variant="secondary"
              isExpanded={false}
              height={36}
              onPress={() => console.log("Pressed", item.id)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  // TEMPORARY: styles for the manual test toggle row — remove alongside it
  testToggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  testToggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
});