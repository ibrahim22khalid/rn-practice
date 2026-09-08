import { Stack } from "expo-router";

export default function AnalyticsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="analytics"
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
    </Stack>
  );
}