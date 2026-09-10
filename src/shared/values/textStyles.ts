import { TextStyle } from "react-native";
import { ThemeColors } from "./colors";

export const getTextStyles = (colors: ThemeColors) =>
  ({
    heading1: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    heading2: {
      fontSize: 22,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    body: {
      fontSize: 15,
      fontWeight: "400",
      color: colors.textPrimary,
    },
    caption: {
      fontSize: 12,
      fontWeight: "400",
      color: colors.textSecondary,
    },
    // New: shared uppercase/letter-spaced label style — used for section
    // headers like "DAYS CLEAN", "MILESTONES", "ACCOUNT", "SUBSCRIPTION".
    // Added here instead of hardcoding letterSpacing/textTransform inside
    // each screen's StyleSheet, per the "tokens, not per-screen" rule.
    overline: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
  } satisfies Record<string, TextStyle>);