const Palette = {
  // Grayscale
  white: "#FFFFFF",
  black: "#000000",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Brand
  indigo500: "#4F46E5",
  indigo600: "#4338CA",
  amber500: "#F59E0B",

  // Status
  red500: "#DC2626",
  red600: "#B91C1C",
  green500: "#16A34A",
  green600: "#15803D",
  blue500: "#2563EB",
  yellow500: "#EAB308",
  orange500: "#EA580C",
  purple500: "#9333EA",
  pink500: "#DB2777",
  teal500: "#0D9488",
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  primary: string;
  secondary: string;
  error: string;
  success: string;
  warning: string;
  info: string;
};

export const LightColors: ThemeColors = {
  background: Palette.white,
  surface: Palette.gray50,
  surfaceElevated: Palette.white,
  textPrimary: Palette.gray900,
  textSecondary: Palette.gray500,
  textDisabled: Palette.gray300,
  border: Palette.gray200,
  primary: Palette.indigo500,
  secondary: Palette.amber500,
  error: Palette.red500,
  success: Palette.green500,
  warning: Palette.yellow500,
  info: Palette.blue500,
};

export const DarkColors: ThemeColors = {
  background: Palette.gray900,
  surface: Palette.gray800,
  surfaceElevated: Palette.gray700,
  textPrimary: Palette.gray50,
  textSecondary: Palette.gray400,
  textDisabled: Palette.gray600,
  border: Palette.gray700,
  primary: Palette.indigo600,
  secondary: Palette.amber500,
  error: Palette.red600,
  success: Palette.green600,
  warning: Palette.yellow500,
  info: Palette.blue500,
};

export { Palette };