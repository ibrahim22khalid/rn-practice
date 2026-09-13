import { Stack } from 'expo-router'

// Declares the existing habit routes; shared data now comes from the root query cache.
export default function HabitsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ headerShown: false }} />
    </Stack>
  )
}
