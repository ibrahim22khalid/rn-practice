import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View>
      <Text>Home Screen</Text>

      <Link href="/settings">Go to Settings</Link>
      <Link href="/profile">Go to Profile</Link>
    </View>
  );
}