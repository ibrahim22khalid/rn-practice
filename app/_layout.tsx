import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { Stack } from "expo-router";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { DevToolsBubble } from "react-native-react-query-devtools";
import { ThemeProvider } from "../src/shared/theme/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Bridges native app foreground/background changes to React Query's focus state.
function handleAppStateChange(status: AppStateStatus): void {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

// Provides one application-wide query cache, native devtools, and the existing theme.
export default function RootLayout() {
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
      {/* React Query Devtools are only available in development mode. */}
      {__DEV__ && <DevToolsBubble queryClient={queryClient} />}
    </QueryClientProvider>
  );
}
