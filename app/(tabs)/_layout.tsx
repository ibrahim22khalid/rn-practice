import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import BottomTabBar from "../../src/components/BottomTabBar";

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
