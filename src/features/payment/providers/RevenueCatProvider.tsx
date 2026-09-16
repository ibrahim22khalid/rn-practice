// Imports the React primitives needed to own shared RevenueCat state and expose it through context.
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Imports ReactNode as a type only because it describes children and has no runtime responsibility.
import type { ReactNode } from "react";

// Imports RevenueCat-owned types so the provider stores the SDK's exact data shapes without local copies.
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

// Imports the focused service operations instead of letting the provider call the native SDK directly.
import {
  configureRevenueCat,
  getCurrentRevenueCatOffering,
  getRevenueCatCustomerInfo,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from "../services/revenueCatService";

// Describes the shared integration state and the one intentional retry action available to consumers.
export type RevenueCatContextValue = {
  isConfigured: boolean;
  isLoading: boolean;
  currentOffering: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  errorMessage: string | null;
  reloadRevenueCat: () => Promise<void>;
  purchasePackage: (revenueCatPackage: PurchasesPackage) => Promise<CustomerInfo>;
  restorePurchases: () => Promise<CustomerInfo>;
};

// Starts undefined so the public hook can detect accidental use outside RevenueCatProvider.
export const RevenueCatContext = createContext<
  RevenueCatContextValue | undefined
>(undefined);

// Converts an unknown rejection into a safe message without assuming an error shape or using any.
function getRevenueCatErrorMessage(error: unknown): string {
  // Preserves the safe missing-environment message produced by our own configuration service.
  if (error instanceof Error) {
    return error.message;
  }

  // Provides a deterministic fallback when a native rejection is not a JavaScript Error instance.
  return "RevenueCat could not load the subscription information.";
}

// Owns RevenueCat's application-wide data for every screen below the root layout.
export function RevenueCatProvider({ children }: { children: ReactNode }) {
  // Tracks whether the guarded SDK configuration step has completed successfully.
  const [isConfigured, setIsConfigured] = useState(false);

  // Starts true because the provider performs its initial load immediately after mounting.
  const [isLoading, setIsLoading] = useState(true);

  // Stores the current remotely configured offering; null is also the valid empty-state result.
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);

  // Stores RevenueCat's authoritative customer snapshot for later entitlement checks.
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Stores user-safe integration feedback without retaining or exposing the API key.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Defines one reusable startup/retry workflow so initial loading and manual retry behave consistently.
  const reloadRevenueCat = useCallback(async (): Promise<void> => {
    // Enters the loading state and clears an earlier failure before beginning a fresh attempt.
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Completes the shared idempotent configuration before any RevenueCat data request runs.
      await configureRevenueCat();

      // Records successful configuration independently from later offering or CustomerInfo failures.
      setIsConfigured(true);

      // Loads independent RevenueCat snapshots concurrently to keep application startup focused and fast.
      const [nextOffering, nextCustomerInfo] = await Promise.all([
        getCurrentRevenueCatOffering(),
        getRevenueCatCustomerInfo(),
      ]);

      // Replaces the integration-owned offering with the latest SDK result, including a valid null result.
      setCurrentOffering(nextOffering);

      // Replaces the customer snapshot that will later drive the premium entitlement check.
      setCustomerInfo(nextCustomerInfo);
    } catch (error: unknown) {
      // Turns configuration or loading failures into one explicit error state for the Payment screen.
      setErrorMessage(getRevenueCatErrorMessage(error));
    } finally {
      // Ends loading for success, empty offering, or failure so the UI never remains stuck on a spinner.
      setIsLoading(false);
    }
  }, []);

  // Purchases one selected package and synchronizes the provider with the CustomerInfo returned on success.
  const purchasePackage = useCallback(
    async (revenueCatPackage: PurchasesPackage): Promise<CustomerInfo> => {
      // Delegates native SDK work to the service so this provider remains focused on shared state ownership.
      const nextCustomerInfo = await purchaseRevenueCatPackage(
        revenueCatPackage,
      );

      // Replaces the old snapshot so every consumer derives access from the verified purchase result.
      setCustomerInfo(nextCustomerInfo);

      // Gives the initiating screen the same result for outcome-specific feedback and verification.
      return nextCustomerInfo;
    },
    [],
  );

  // Restores purchases on user request and synchronizes every consumer with the returned CustomerInfo.
  const restorePurchases = useCallback(async (): Promise<CustomerInfo> => {
    // Delegates the store-facing operation to the service rather than calling the SDK from UI code.
    const nextCustomerInfo = await restoreRevenueCatPurchases();

    // Replaces the integration snapshot so entitlement-controlled UI reacts to the restore result.
    setCustomerInfo(nextCustomerInfo);

    // Returns the same snapshot so the initiating screen can show accurate restore feedback.
    return nextCustomerInfo;
  }, []);

  // Starts RevenueCat once when this application-level provider mounts, not when PaymentScreen mounts.
  useEffect(() => {
    // Intentionally discards the returned promise because reloadRevenueCat captures failures in provider state.
    // The callback synchronizes React with the external SDK; its state updates describe that async integration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reloadRevenueCat();
  }, [reloadRevenueCat]);

  // Keeps the context object stable unless one of its meaningful fields actually changes.
  const value = useMemo<RevenueCatContextValue>(
    () => ({
      isConfigured,
      isLoading,
      currentOffering,
      customerInfo,
      errorMessage,
      reloadRevenueCat,
      purchasePackage,
      restorePurchases,
    }),
    [
      customerInfo,
      currentOffering,
      errorMessage,
      isConfigured,
      isLoading,
      purchasePackage,
      reloadRevenueCat,
      restorePurchases,
    ],
  );

  // Makes one RevenueCat integration state available to the complete Expo Router tree.
  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}
