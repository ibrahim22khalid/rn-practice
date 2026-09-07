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
  } satisfies Record<string, TextStyle>);