import { Stack } from 'expo-router'
import { HabitsProvider } from '../../../src/features/habits/hooks/UseHabits'

export default function HabitsLayout() {
  return (
    <HabitsProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ headerShown: false }} />
      </Stack>
    </HabitsProvider>
  )
}
