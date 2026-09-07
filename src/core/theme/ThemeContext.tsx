// ThemeContext.tsx
import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { LightColors, DarkColors, ThemeColors } from "../values/colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Reads the device's current appearance setting, updates live if the user
  // changes it from the OS settings while the app is open
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState<ThemeMode>("system");

  // "system" defers to the OS; otherwise the user's explicit choice wins
  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const colors = isDark ? DarkColors : LightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, mode, isDark, setMode }),
    [colors, mode, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}