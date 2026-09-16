// Imports native primitives used by the development-only diagnostic card.
import { StyleSheet, Text, View } from "react-native";

// Reuses the project's Card and theme tokens so debugging UI remains visually isolated but consistent.
import Card from "../../../shared/components/Card";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing } from "../../../shared/values/spacing";

// Defines only the non-sensitive evidence required by the ticket's development panel.
type RevenueCatDebugPanelProps = {
  isConfigured: boolean;
  offeringIdentifier: string | null;
  selectedPackageIdentifier: string | null;
  isPremiumActive: boolean;
};

// Displays integration evidence without accepting or exposing the RevenueCat API key.
export default function RevenueCatDebugPanel({
  isConfigured,
  offeringIdentifier,
  selectedPackageIdentifier,
  isPremiumActive,
}: RevenueCatDebugPanelProps) {
  // Reads the existing typography and colors for clear development diagnostics.
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  // Renders the exact four values requested by the lab architecture.
  return (
    <Card style={styles.card}>
      <Text style={textStyles.overline}>RevenueCat debug</Text>

      <View style={styles.rows}>
        <Text style={textStyles.caption}>
          Configured: {isConfigured ? "yes" : "no"}
        </Text>
        <Text style={textStyles.caption}>
          Current offering: {offeringIdentifier ?? "none"}
        </Text>
        <Text style={textStyles.caption}>
          Selected package: {selectedPackageIdentifier ?? "none"}
        </Text>
        <Text
          style={[
            textStyles.caption,
            { color: isPremiumActive ? colors.success : colors.textSecondary },
          ]}
        >
          Premium active: {isPremiumActive ? "yes" : "no"}
        </Text>
      </View>
    </Card>
  );
}

// Keeps the diagnostic panel compact so it does not compete with the package list.
const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  rows: {
    gap: Spacing.xs,
  },
});
