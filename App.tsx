import FlexboxPractice from "./components/FlexBoxPractice";
import { ThemeProvider } from "./core/theme/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

import CardsScreen from "./screens/CardsScreen"; 
import FixedLayoutScreen from "./screens/FixedLayoutScreen";

export default function App() {
  return (
    <SafeAreaProvider >
      <ThemeProvider>
    
      <CardsScreen />
    </ThemeProvider>
    </SafeAreaProvider>
    
  );
}

