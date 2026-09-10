import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../theme/ThemeContext";
import { getTextStyles } from "../values/textStyles";

type ButtonVariant = "primary" | "secondary";

interface AppButtonProps {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  buttonColor?: string;
  borderColor?: string;
  buttonRadius?: number;
  height?: number;
  textStyle?: TextStyle;
  textColor?: string;
  isLoading?: boolean;
  isEnabled?: boolean;
  isExpanded?: boolean;
  elevation?: number;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export default function AppButton({
  text,
  onPress,
  variant = "primary",
  buttonColor,
  borderColor,
  buttonRadius = 10,
  height = 48,
  textStyle,
  textColor,
  isLoading = false,
  isEnabled = true,
  isExpanded = true,
  elevation = 0,
  leading,
  trailing,
}: AppButtonProps) {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);

  const disabled = isLoading || !isEnabled;
  const isPrimary = variant === "primary";

  const shadowStyle: ViewStyle =
    elevation > 0
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: elevation / 2 },
          shadowOpacity: 0.2,
          shadowRadius: elevation,
          elevation, // Android
        }
      : {};

  const resolvedBackground = !isEnabled
    ? colors.border
    : buttonColor
    ? buttonColor
    : isPrimary
    ? colors.primary
    : "transparent";

  const resolvedBorderColor = !isEnabled
    ? "transparent"
    : borderColor
    ? borderColor
    : isPrimary
    ? "transparent"
    : colors.primary;

  const resolvedTextColor = !isEnabled
    ? colors.textSecondary
    : textColor
    ? textColor
    : isPrimary
    ? colors.background
    : colors.primary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        isExpanded ? styles.expanded : styles.wrap,
        {
          height,
          borderRadius: buttonRadius,
          backgroundColor: resolvedBackground,
          borderWidth: isPrimary && !borderColor ? 0 : 1.5,
          borderColor: resolvedBorderColor,
        },
        styles.inner,
        shadowStyle,
      ]}
    >
      <View style={styles.row}>
        {leading && <View style={styles.spacer}>{leading}</View>}
        <Text
          style={[textStyles.body, { color: resolvedTextColor }, textStyle]}
          numberOfLines={1}
        >
          {text}
        </Text>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={resolvedTextColor}
            style={styles.loadingIndicator}
          />
        ) : (
          trailing && <View style={styles.spacer}>{trailing}</View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  expanded: {
    width: "100%",
  },
  wrap: {
    alignSelf: "flex-start",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    marginHorizontal: 5,
  },
  loadingIndicator: {
    marginStart: 12,
  },
});