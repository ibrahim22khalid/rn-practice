import Svg, { Path } from "react-native-svg";

import { useTheme } from "../../core/theme/ThemeContext";

export interface TabBarIconProps {
  active?: boolean;
  size?: number;
}

export default function AnalyticsIcon({
  active = false,
  size = 24,
}: TabBarIconProps) {
  const { colors } = useTheme();
  const color = active ? colors.primary : colors.textSecondary;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 309 144"
      fill="none"
    >
      <Path
        d="M1.29663 126L23.1538 122.4L40.6395 105.6L53.7538 127.2L66.8681 117.6L79.9823 127.2L110.582 110.4L119.325 99.6L132.439 122.4L141.182 129.6L307.297 26.4"
        stroke={color}
        strokeWidth={2.59286}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M37.1423 105.6C37.1423 108.249 38.7094 110.4 40.6395 110.4C42.5696 110.4 44.1366 108.249 44.1366 105.6C44.1366 102.951 42.5696 100.8 40.6395 100.8C38.7094 100.8 37.1423 102.951 37.1423 105.6Z"
        fill="#FA5555"
        stroke="#0E2121"
        strokeWidth={1.55571}
      />
      <Path
        d="M63.3709 117.6C63.3709 120.249 64.9379 122.4 66.8681 122.4C68.7982 122.4 70.3652 120.249 70.3652 117.6C70.3652 114.951 68.7982 112.8 66.8681 112.8C64.9379 112.8 63.3709 114.951 63.3709 117.6Z"
        fill="#FA5555"
        stroke="#0E2121"
        strokeWidth={1.55571}
      />
      <Path
        d="M115.391 99.6C115.391 102.58 117.154 105 119.325 105C121.497 105 123.26 102.58 123.26 99.6C123.26 96.6197 121.497 94.2 119.325 94.2C117.154 94.2 115.391 96.6197 115.391 99.6Z"
        fill="#FA5555"
        stroke="#0E2121"
        strokeWidth={1.55571}
      />
      <Path
        d="M128.942 122.4C128.942 125.049 130.509 127.2 132.439 127.2C134.37 127.2 135.937 125.049 135.937 122.4C135.937 119.751 134.37 117.6 132.439 117.6C130.509 117.6 128.942 119.751 128.942 122.4Z"
        fill="#FA5555"
        stroke="#0E2121"
        strokeWidth={1.55571}
      />
    </Svg>
  );
}