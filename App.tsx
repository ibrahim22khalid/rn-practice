import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/core/theme/ThemeContext";
import CardsScreen from "./src/screens/CardsScreen";

export default function App() {
  return (
    <SafeAreaProvider >
      <ThemeProvider>
      <CardsScreen />
    </ThemeProvider>
    </SafeAreaProvider>
    
  );
}

