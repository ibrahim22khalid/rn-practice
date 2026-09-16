// Imports the native controls used to make one RevenueCat package selectable without purchasing it yet.
import { Pressable, StyleSheet, Text, View } from "react-native";

// Imports RevenueCat's package type so this component reads the installed SDK shape directly.
import type { PurchasesPackage } from "react-native-purchases";

// Imports the existing project theme and spacing conventions instead of defining a payment-only design system.
import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Radius, Spacing } from "../../../shared/values/spacing";

// Describes the SDK package to display and the screen-owned selection action.
type PaymentPackageOptionProps = {
  revenueCatPackage: PurchasesPackage;
  isSelected: boolean;
  onSelect: (packageIdentifier: string) => void;
};

// Displays RevenueCat product data while keeping the actual selection state in PaymentScreen.
export default function PaymentPackageOption({
  revenueCatPackage,
  isSelected,
  onSelect,
}: PaymentPackageOptionProps) {
  // Reads shared colors and text tokens so the option follows the rest of the application.
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  // Uses the installed SDK's `product` field; this is the store product contained by the package.
  const { product } = revenueCatPackage;

  // Renders a selectable plan only; no purchase call exists in this Part 2 component.
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${product.title}, ${product.priceString}`}
      onPress={() => onSelect(revenueCatPackage.identifier)}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {/* Shows the customer-facing title returned by RevenueCat instead of a hard-coded plan name. */}
      <Text style={textStyles.heading2}>{product.title}</Text>

      {/* Shows RevenueCat's localized price string so the app does not format currency itself. */}
      <Text style={[textStyles.body, { color: colors.primary }]}>
        {product.priceString}
      </Text>

      {/* Exposes the RevenueCat package identifier required by the training ticket and debug workflow. */}
      <View style={styles.identifierRow}>
        <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
          Package
        </Text>
        <Text style={[textStyles.caption, { color: colors.textPrimary }]}>
          {revenueCatPackage.identifier}
        </Text>
      </View>
    </Pressable>
  );
}

// Keeps layout-only values outside the render function so selecting a package does not recreate them.
const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 2,
    borderRadius: Radius.lg,
  },
  identifierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
});
