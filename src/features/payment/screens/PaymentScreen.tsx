// Imports the native primitives needed for the four explicit loading outcomes and selectable plan list.
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Imports local state and synchronous guards for selection, purchase, and restore actions.
import { useRef, useState } from "react";

// Imports the existing Expo background and safe-area behavior used by other feature screens.
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Imports shared project UI and design tokens instead of creating payment-specific duplicates.
import AppButton from "../../../shared/components/AppButton";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing } from "../../../shared/values/spacing";

// Imports payment integration state, the entitlement identifier, and focused feature components.
import { useRevenueCat } from "../hooks/useRevenueCat";
import { PREMIUM_ENTITLEMENT_ID } from "../constants/revenueCatConstants";
import PaymentPackageOption from "../components/PaymentPackageOption";
import RevenueCatDebugPanel from "../components/RevenueCatDebugPanel";
import {
  getRevenueCatPurchaseErrorMessage,
  getRevenueCatRestoreErrorMessage,
  isRevenueCatPurchaseCancellation,
} from "../services/revenueCatService";

// Represents only temporary screen feedback; premium access is never duplicated into this local state.
type PurchaseFeedback =
  | {
      kind: "success" | "cancelled" | "error";
      message: string;
    }
  | null;

// Represents restore outcome feedback without duplicating CustomerInfo or entitlement state locally.
type RestoreFeedback =
  | {
      kind: "success" | "empty" | "error";
      message: string;
    }
  | null;

// Presents RevenueCat state without directly calling the native SDK from the screen layer.
export default function PaymentScreen() {
  // Reads shared styling and device insets used to position content safely.
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();

  // Reads the application-owned RevenueCat state and retry action from the root provider.
  const {
    isConfigured,
    isLoading,
    currentOffering,
    customerInfo,
    errorMessage,
    reloadRevenueCat,
    purchasePackage,
    restorePurchases,
  } = useRevenueCat();

  // Keeps only the user's current UI choice locally; package data itself remains owned by RevenueCat.
  const [selectedPackageIdentifier, setSelectedPackageIdentifier] = useState<
    string | null
  >(null);

  // Tracks visual purchase progress locally because it belongs only to this screen action.
  const [isPurchasePending, setIsPurchasePending] = useState(false);

  // Holds short-lived outcome feedback without pretending to be subscription or entitlement state.
  const [purchaseFeedback, setPurchaseFeedback] =
    useState<PurchaseFeedback>(null);

  // Tracks restore progress independently because Restore Purchases is a separate user-triggered operation.
  const [isRestorePending, setIsRestorePending] = useState(false);

  // Holds temporary restore feedback while access continues to come only from CustomerInfo.
  const [restoreFeedback, setRestoreFeedback] =
    useState<RestoreFeedback>(null);

  // Closes the tiny same-render gap in which two fast taps could both see stale React state as false.
  const purchaseLockRef = useRef(false);

  // Prevents two fast restore taps from starting duplicate native requests before React re-renders.
  const restoreLockRef = useRef(false);

  // Derives the package list from the current offering instead of copying it into another state variable.
  const availablePackages = currentOffering?.availablePackages ?? [];

  // Derives access directly from the latest CustomerInfo rather than storing an independent isPremium flag.
  const isPremiumActive = Boolean(
    customerInfo?.entitlements.active[PREMIUM_ENTITLEMENT_ID],
  );

  // Resolves the selected identifier to an SDK package and falls back to RevenueCat's first ordered package.
  const selectedPackage =
    availablePackages.find(
      (revenueCatPackage) =>
        revenueCatPackage.identifier === selectedPackageIdentifier,
    ) ??
    availablePackages[0] ??
    null;

  // Derives the visible selection so offering changes never require an effect that copies RevenueCat data locally.
  const resolvedSelectedPackageIdentifier =
    selectedPackage?.identifier ?? null;

  // Starts one explicit purchase attempt and maps its three outcomes to intentional interface feedback.
  const handlePurchase = async (): Promise<void> => {
    // Prevents missing-selection calls and duplicate submissions before React can re-render the disabled button.
    if (
      !selectedPackage ||
      purchaseLockRef.current ||
      restoreLockRef.current
    ) {
      return;
    }

    // Locks immediately, shows button progress, and clears feedback from an earlier attempt.
    purchaseLockRef.current = true;
    setIsPurchasePending(true);
    setPurchaseFeedback(null);
    setRestoreFeedback(null);

    try {
      // Waits for RevenueCat to verify the Test Store purchase and return updated CustomerInfo.
      const nextCustomerInfo = await purchasePackage(selectedPackage);

      // Reads the expected entitlement from the returned snapshot instead of trusting the completed button flow.
      const purchasedPremiumIsActive = Boolean(
        nextCustomerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID],
      );

      // Explains the verified access result, including the unexpected case where the entitlement was not granted.
      setPurchaseFeedback(
        purchasedPremiumIsActive
          ? {
              kind: "success",
              message: "Purchase successful. Premium access is active.",
            }
          : {
              kind: "error",
              message:
                "The purchase completed, but Premium access is not active. Check the entitlement configuration before trying again.",
            },
      );
    } catch (error: unknown) {
      // Treats cancellation as a normal user choice rather than presenting a frightening generic failure.
      if (isRevenueCatPurchaseCancellation(error)) {
        setPurchaseFeedback({
          kind: "cancelled",
          message: "Purchase cancelled. You were not charged.",
        });
      } else {
        // Preserves useful RevenueCat detail and keeps the action available for an intentional retry.
        setPurchaseFeedback({
          kind: "error",
          message: `${getRevenueCatPurchaseErrorMessage(error)} You can try again.`,
        });
      }
    } finally {
      // Releases both the synchronous lock and visual pending state for every purchase outcome.
      purchaseLockRef.current = false;
      setIsPurchasePending(false);
    }
  };

  // Runs Restore Purchases only from the visible user action and updates feedback from returned CustomerInfo.
  const handleRestorePurchases = async (): Promise<void> => {
    // Blocks duplicate restores and prevents restore from overlapping an in-flight purchase.
    if (restoreLockRef.current || purchaseLockRef.current) {
      return;
    }

    // Locks synchronously, enters visible loading, and clears feedback from an earlier operation.
    restoreLockRef.current = true;
    setIsRestorePending(true);
    setRestoreFeedback(null);
    setPurchaseFeedback(null);

    try {
      // Waits for RevenueCat to re-sync purchases and return its latest authoritative customer snapshot.
      const restoredCustomerInfo = await restorePurchases();

      // Checks access in the returned CustomerInfo rather than assuming a completed restore found a purchase.
      const restoredPremiumIsActive = Boolean(
        restoredCustomerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID],
      );

      // Distinguishes a restored entitlement from a successful restore that found no active Premium purchase.
      setRestoreFeedback(
        restoredPremiumIsActive
          ? {
              kind: "success",
              message: "Purchases restored. Premium access is active.",
            }
          : {
              kind: "empty",
              message: "Restore completed. No active Premium purchase was found.",
            },
      );
    } catch (error: unknown) {
      // Keeps restore failures useful and retryable without changing the existing CustomerInfo snapshot.
      setRestoreFeedback({
        kind: "error",
        message: `${getRevenueCatRestoreErrorMessage(error)} Please try restoring again.`,
      });
    } finally {
      // Releases both duplicate-request protection and the button loading state for every outcome.
      restoreLockRef.current = false;
      setIsRestorePending(false);
    }
  };

  // Produces the mutually exclusive Loading, Error, Empty, or Success body for the current SDK state.
  const renderRevenueCatContent = () => {
    // Shows progress without rendering purchase actions while offerings are unresolved.
    if (isLoading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[textStyles.body, { color: colors.textSecondary }]}>
            Loading subscription plans...
          </Text>
        </View>
      );
    }

    // Shows a deliberate failure state with one retry path instead of silently treating errors as empty data.
    if (errorMessage) {
      return (
        <View style={styles.centeredState}>
          <Text style={textStyles.heading2}>Could not load plans</Text>
          <Text style={[textStyles.body, { color: colors.error }]}>
            {errorMessage}
          </Text>
          <AppButton
            text="Retry"
            variant="secondary"
            onPress={() => {
              void reloadRevenueCat();
            }}
          />
        </View>
      );
    }

    // Treats a missing current offering as an intentional empty configuration, not a network failure.
    if (!currentOffering) {
      return (
        <View style={styles.centeredState}>
          <Text style={textStyles.heading2}>No subscription plans available</Text>
          <Text style={[textStyles.body, { color: colors.textSecondary }]}>
            RevenueCat did not return a current offering.
          </Text>
          <AppButton
            text="Check again"
            variant="secondary"
            onPress={() => {
              void reloadRevenueCat();
            }}
          />
        </View>
      );
    }

    // Treats an existing but empty offering separately so dashboard package mistakes remain understandable.
    if (availablePackages.length === 0) {
      return (
        <View style={styles.centeredState}>
          <Text style={textStyles.heading2}>This offering has no packages</Text>
          <Text style={[textStyles.body, { color: colors.textSecondary }]}>
            Add at least one package to the current RevenueCat offering.
          </Text>
        </View>
      );
    }

    // Displays the successful package response and the purchase action backed by the selected SDK package.
    return (
      <View style={styles.purchaseSection}>
        <View style={styles.packageList} accessibilityRole="radiogroup">
          {availablePackages.map((revenueCatPackage) => (
            <PaymentPackageOption
              key={revenueCatPackage.identifier}
              revenueCatPackage={revenueCatPackage}
              isSelected={
                revenueCatPackage.identifier ===
                resolvedSelectedPackageIdentifier
              }
              onSelect={(packageIdentifier) => {
                // A new selection starts a fresh decision, so feedback from an older package is cleared.
                setSelectedPackageIdentifier(packageIdentifier);
                setPurchaseFeedback(null);
              }}
            />
          ))}
        </View>

        {/* Makes entitlement-controlled access visible outside the development-only debug panel. */}
        <View
          style={[
            styles.accessStatus,
            {
              backgroundColor: colors.surface,
              borderColor: isPremiumActive ? colors.success : colors.border,
            },
          ]}
        >
          <Text style={textStyles.heading2}>
            {isPremiumActive ? "Premium access active" : "Premium access inactive"}
          </Text>
          <Text style={[textStyles.body, { color: colors.textSecondary }]}>
            {'Access is derived from CustomerInfo.entitlements.active["premium"].'}
          </Text>
        </View>

        {/* Gives cancellation, failure, and success distinct visible outcomes without changing access locally. */}
        {purchaseFeedback && (
          <Text
            accessibilityLiveRegion="polite"
            style={[
              textStyles.body,
              {
                color:
                  purchaseFeedback.kind === "success"
                    ? colors.success
                    : purchaseFeedback.kind === "error"
                      ? colors.error
                      : colors.textSecondary,
              },
            ]}
          >
            {purchaseFeedback.message}
          </Text>
        )}

        {/* Disables duplicate submissions while pending and stops further purchases after access is active. */}
        <AppButton
          text={
            isPremiumActive
              ? "Premium is active"
              : purchaseFeedback?.kind === "error"
                ? "Try purchase again"
                : "Purchase selected plan"
          }
          isLoading={isPurchasePending}
          isEnabled={
            Boolean(selectedPackage) &&
            !isPurchasePending &&
            !isRestorePending &&
            !isPremiumActive
          }
          onPress={() => {
            void handlePurchase();
          }}
        />

        {/* Restore stays a separate user action and never runs automatically during screen rendering. */}
        <View style={styles.restoreSection}>
          <AppButton
            text={
              restoreFeedback?.kind === "error"
                ? "Try restore again"
                : "Restore purchases"
            }
            variant="secondary"
            isLoading={isRestorePending}
            isEnabled={!isPurchasePending && !isRestorePending}
            onPress={() => {
              void handleRestorePurchases();
            }}
          />

          {/* Announces whether restore found Premium, found nothing, or failed without creating access state. */}
          {restoreFeedback && (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                textStyles.body,
                {
                  color:
                    restoreFeedback.kind === "success"
                      ? colors.success
                      : restoreFeedback.kind === "error"
                        ? colors.error
                        : colors.textSecondary,
                },
              ]}
            >
              {restoreFeedback.message}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Renders one scrollable Payment tab that remains usable on smaller Android devices.
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={textStyles.heading1}>Payment</Text>
        <Text style={[textStyles.body, { color: colors.textSecondary }]}>
          Choose a RevenueCat Test Store package.
        </Text>

        {/* Keeps configuration evidence out of production builds and never displays the API key. */}
        {__DEV__ && (
          <RevenueCatDebugPanel
            isConfigured={isConfigured}
            offeringIdentifier={currentOffering?.identifier ?? null}
            selectedPackageIdentifier={resolvedSelectedPackageIdentifier}
            isPremiumActive={isPremiumActive}
          />
        )}

        {/* Renders exactly one of the ticket's loading, error, empty, or success states. */}
        {renderRevenueCatContent()}
      </ScrollView>
    </View>
  );
}

// Keeps static layout values outside the component and reuses the project's spacing scale.
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  packageList: {
    gap: Spacing.md,
  },
  purchaseSection: {
    gap: Spacing.lg,
  },
  accessStatus: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: Spacing.md,
  },
  restoreSection: {
    gap: Spacing.sm,
  },
});
