// Keeps the access-level identifier in one place so every entitlement check uses the exact dashboard value.
export const PREMIUM_ENTITLEMENT_ID = "premium" as const;

// Reads the Test Store SDK key that Expo inlines from the ignored .env.local file into the client bundle.
// Trimming prevents an accidental leading or trailing space from producing a misleading configuration failure.
export const REVENUECAT_TEST_STORE_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY?.trim();
