
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../core/theme/ThemeContext";

export default function FixedLayoutScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>
          Header
        </Text>
      </View>

      <View style={styles.middle}>
        <Text style={{ color: colors.textPrimary }}>Main Content</Text>
      </View>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.textPrimary }}>Footer</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    height: 80, 
    justifyContent: "center",
    alignItems: "center",
  },
  middle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});