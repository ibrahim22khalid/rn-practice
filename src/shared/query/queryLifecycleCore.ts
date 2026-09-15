import type { AppStateStatus } from "react-native";

export type NetworkConnectionState = Readonly<{
  isConnected?: boolean;
}>;

type RemoveListener = () => void;

export type QueryLifecycleDependencies = Readonly<{
  isWeb: boolean;
  getInitialNetworkState: () => Promise<NetworkConnectionState>;
  subscribeToNetworkState: (
    listener: (state: NetworkConnectionState) => void,
  ) => RemoveListener;
  getInitialAppState: () => AppStateStatus;
  subscribeToAppState: (
    listener: (state: AppStateStatus) => void,
  ) => RemoveListener;
  setOnline: (isOnline: boolean) => void;
  setFocused: (isFocused: boolean) => void;
  reportInitialNetworkError: (error: unknown) => void;
}>;

// Converts the platform network payload into the strict boolean TanStack Query expects.
export function mapNetworkStateToOnline(
  state: NetworkConnectionState,
): boolean {
  return state.isConnected === true;
}

// Treats only the active app state as focused for query refetch behavior.
export function mapAppStateToFocused(state: AppStateStatus): boolean {
  return state === "active";
}

// Connects platform network and app-state events to query lifecycle managers.
export function setupQueryLifecycle(
  dependencies: QueryLifecycleDependencies,
): RemoveListener {
  if (dependencies.isWeb) return () => undefined;

  let isDisposed = false;
  let receivedNetworkEvent = false;
  let receivedAppStateEvent = false;
  let isCleanedUp = false;

  const removeNetworkListener = dependencies.subscribeToNetworkState(
    (state) => {
      if (isDisposed) return;
      receivedNetworkEvent = true;
      dependencies.setOnline(mapNetworkStateToOnline(state));
    },
  );
  const removeAppStateListener = dependencies.subscribeToAppState((state) => {
    if (isDisposed) return;
    receivedAppStateEvent = true;
    dependencies.setFocused(mapAppStateToFocused(state));
  });

  if (!receivedAppStateEvent) {
    dependencies.setFocused(
      mapAppStateToFocused(dependencies.getInitialAppState()),
    );
  }

  void dependencies
    .getInitialNetworkState()
    .then((state) => {
      if (!isDisposed && !receivedNetworkEvent) {
        dependencies.setOnline(mapNetworkStateToOnline(state));
      }
    })
    .catch((error: unknown) => {
      if (!isDisposed) dependencies.reportInitialNetworkError(error);
    });

  return () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    isDisposed = true;
    removeNetworkListener();
    removeAppStateListener();
  };
}
