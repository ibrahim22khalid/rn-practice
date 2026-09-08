import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AnalyticsScreen from "../screens/AnalyticsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BottomTabBar from "../components/BottomTabBar";

export type TabParamList = {
  Analytics: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}