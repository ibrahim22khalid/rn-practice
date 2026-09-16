import { Redirect } from "expo-router";

// Gives the application root URL a real destination instead of showing Expo Router's unmatched-route screen.
export default function IndexRoute() {
  // Keeps the existing Habits tab as the default landing screen when the development build opens `rn-practice:///`.
  return <Redirect href="/habits" />;
}
