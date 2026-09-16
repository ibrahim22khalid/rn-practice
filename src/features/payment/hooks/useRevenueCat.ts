// Imports useContext to read the nearest application-level RevenueCatProvider value.
import { useContext } from "react";

// Imports the context and its public value type from the feature-owned provider module.
import {
  RevenueCatContext,
  type RevenueCatContextValue,
} from "../providers/RevenueCatProvider";

// Gives feature components a typed API without exposing React context mechanics at every call site.
export function useRevenueCat(): RevenueCatContextValue {
  // Reads the shared integration state produced by the provider mounted in the root layout.
  const context = useContext(RevenueCatContext);

  // Fails early with an architectural message if a screen is rendered outside the required provider.
  if (!context) {
    throw new Error("useRevenueCat must be used within RevenueCatProvider.");
  }

  // Returns the fully typed integration state and retry action to the consuming component.
  return context;
}
