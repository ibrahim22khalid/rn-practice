import * as Network from "expo-network";
import { AppState, Platform } from "react-native";
import { focusManager, onlineManager } from "@tanstack/react-query";

import { setupQueryLifecycle } from "./queryLifecycleCore";

export function setupMobileQueryLifecycle(): () => void {
  const cleanup = setupQueryLifecycle({
    isWeb: Platform.OS === "web",
    getInitialNetworkState: Network.getNetworkStateAsync,
    subscribeToNetworkState: (listener) => {
      const subscription = Network.addNetworkStateListener(listener);
      return () => subscription.remove();
    },
    getInitialAppState: () => AppState.currentState,
    subscribeToAppState: (listener) => {
      const subscription = AppState.addEventListener("change", listener);
      return () => subscription.remove();
    },
    setOnline: (isOnline) => {
      if (__DEV__) console.debug(`[query lifecycle] online: ${isOnline}`);
      onlineManager.setOnline(isOnline);
    },
    setFocused: (isFocused) => {
      if (__DEV__) console.debug(`[query lifecycle] focused: ${isFocused}`);
      focusManager.setFocused(isFocused);
    },
    reportInitialNetworkError: (error) => {
      if (__DEV__) {
        console.warn("Unable to read the initial network state", error);
      }
    },
  });

  if (__DEV__ && Platform.OS !== "web") {
    console.debug("[query lifecycle] native listeners registered");
  }

  return () => {
    cleanup();
    if (__DEV__ && Platform.OS !== "web") {
      console.debug("[query lifecycle] native listeners removed");
    }
  };
}
