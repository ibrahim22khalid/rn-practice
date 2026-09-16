// Imports the single SDK entry point used to inspect and configure RevenueCat.
import Purchases from "react-native-purchases";

// Imports SDK-owned result types so the integration does not duplicate RevenueCat data shapes locally.
import type {
  CustomerInfo,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

// Imports only the environment-backed key reference; the real key never lives in source control.
import { REVENUECAT_TEST_STORE_API_KEY } from "../constants/revenueCatConstants";

// Shares an in-flight or completed setup promise so simultaneous startup calls cannot configure the SDK twice.
let configurationPromise: Promise<void> | null = null;

// Performs the actual validation and SDK setup behind the public idempotent function below.
async function configureRevenueCatOnce(): Promise<void> {
  // Stops startup with a safe message when the local key is absent, without exposing the key value.
  if (!REVENUECAT_TEST_STORE_API_KEY) {
    throw new Error(
      "RevenueCat Test Store API key is missing from the local environment.",
    );
  }

  // Asks the installed SDK for its real native configuration state instead of tracking a second boolean locally.
  const isConfigured = await Purchases.isConfigured();

  // Makes the operation idempotent when another application-startup path configured RevenueCat first.
  if (isConfigured) {
    return;
  }

  // Configures the SDK with the Test Store key and omits appUserID so RevenueCat creates an anonymous test customer.
  Purchases.configure({
    apiKey: REVENUECAT_TEST_STORE_API_KEY,
  });
}

// Exposes one startup operation that callers can await before requesting CustomerInfo or Offerings.
export function configureRevenueCat(): Promise<void> {
  // Returns the existing promise so React development behavior cannot start duplicate native configuration work.
  if (configurationPromise) {
    return configurationPromise;
  }

  // Stores the first setup attempt immediately, closing the gap where a second caller could enter concurrently.
  configurationPromise = configureRevenueCatOnce().catch((error: unknown) => {
    // Clears a failed attempt so a later explicit retry can perform configuration again.
    configurationPromise = null;

    // Preserves the original typed error for the future provider to turn into user-safe feedback.
    throw error;
  });

  // Lets the future provider await the same shared setup result.
  return configurationPromise;
}

// Loads the remotely configured offering that RevenueCat selected as current for this anonymous customer.
export async function getCurrentRevenueCatOffering(): Promise<PurchasesOffering | null> {
  // Guarantees that every SDK read happens after the shared one-time configuration has completed.
  await configureRevenueCat();

  // Fetches the complete offerings response because the SDK exposes the current offering inside that object.
  const offerings = await Purchases.getOfferings();

  // Returns null as a valid empty result so the UI can distinguish no current offering from a request failure.
  return offerings.current;
}

// Loads RevenueCat's authoritative snapshot of purchases and active entitlements for the current customer.
export async function getRevenueCatCustomerInfo(): Promise<CustomerInfo> {
  // Reuses the same guarded configuration promise instead of assuming a caller initialized the SDK correctly.
  await configureRevenueCat();

  // Returns the SDK-owned CustomerInfo object that will later drive the premium entitlement check.
  return Purchases.getCustomerInfo();
}

// Purchases one package selected from the current offering and returns RevenueCat's updated customer snapshot.
export async function purchaseRevenueCatPackage(
  revenueCatPackage: PurchasesPackage,
): Promise<CustomerInfo> {
  // Guarantees that the native SDK is ready before opening the Test Store purchase dialog.
  await configureRevenueCat();

  // Purchases the store product contained by the package and waits for RevenueCat to verify the result.
  const purchaseResult = await Purchases.purchasePackage(revenueCatPackage);

  // Returns only the authoritative snapshot needed by the integration layer to update access.
  return purchaseResult.customerInfo;
}

// Re-syncs purchases only after an explicit user action and returns RevenueCat's latest customer snapshot.
export async function restoreRevenueCatPurchases(): Promise<CustomerInfo> {
  // Guarantees the native SDK is ready before asking the underlying store to restore transactions.
  await configureRevenueCat();

  // Returns the CustomerInfo produced by the restore so the provider can replace its previous snapshot.
  return Purchases.restorePurchases();
}

// Narrows an unknown native rejection to the public RevenueCat error shape without using TypeScript any.
function isPurchasesError(error: unknown): error is PurchasesError {
  // Native SDK errors are object-like and always expose string code and message fields.
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

// Distinguishes an expected user decision from a real purchase failure.
export function isRevenueCatPurchaseCancellation(error: unknown): boolean {
  // Uses the non-deprecated SDK error code instead of treating every rejected purchase as failure.
  return (
    isPurchasesError(error) &&
    error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  );
}

// Converts an unknown purchase rejection into useful feedback while retaining SDK detail when available.
export function getRevenueCatPurchaseErrorMessage(error: unknown): string {
  // RevenueCat messages explain simulated Test Store failures and real SDK/store failures.
  if (isPurchasesError(error)) {
    return error.message;
  }

  // Standard JavaScript errors can still occur around configuration or native bridging.
  if (error instanceof Error) {
    return error.message;
  }

  // Provides a safe retry-oriented fallback for rejection values with no known shape.
  return "The purchase could not be completed. Please try again.";
}

// Converts an unknown restore rejection into useful feedback without assuming a native error shape.
export function getRevenueCatRestoreErrorMessage(error: unknown): string {
  // Keeps RevenueCat's useful store or network explanation when the SDK supplied one.
  if (isPurchasesError(error)) {
    return error.message;
  }

  // Preserves standard configuration or bridge failures that use JavaScript Error.
  if (error instanceof Error) {
    return error.message;
  }

  // Provides a deterministic retry-oriented fallback for an unknown rejection value.
  return "Purchases could not be restored. Please try again.";
}
