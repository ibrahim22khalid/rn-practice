import { Stack } from "expo-router";
import { ItemsProvider } from "../../../src/features/analytics/hooks/UseAnalytics";

export default function AnalyticsLayout() {
  return (
    <ItemsProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="details"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="form"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ItemsProvider>
  );
}
