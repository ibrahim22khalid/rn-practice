import { useEffect } from "react";
import { Stack } from "expo-router";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { DevToolsBubble } from "react-native-react-query-devtools";
import { ThemeProvider } from "../src/shared/theme/ThemeContext";
import { setupMobileQueryLifecycle } from "../src/shared/query/mobileQueryLifecycle";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Provides one application-wide query cache, native devtools, and the existing theme.
export default function RootLayout() {
  useEffect(() => setupMobileQueryLifecycle(), []);

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
