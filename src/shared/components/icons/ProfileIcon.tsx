// ProfileIcon: inline SVG you can toggle between active/inactive colors by
// the `active` prop (active = theme primary, inactive = textSecondary).
import Svg, { Path } from "react-native-svg";

import { useTheme } from "../../theme/ThemeContext";

export interface TabBarIconProps {
  active?: boolean;
  size?: number;
}

export default function ProfileIcon({
  active = false,
  size = 24,
}: TabBarIconProps) {
  const { colors } = useTheme();
  const color = active ? colors.primary : colors.textSecondary;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
    >
      <Path
        d="M18 18C19.8417 18 21.3333 16.5083 21.3333 14.6666C21.3333 12.825 19.8417 11.3333 18 11.3333C16.1583 11.3333 14.6667 12.825 14.6667 14.6666C14.6667 16.5083 16.1583 18 18 18ZM18 19.6666C15.775 19.6666 11.3333 20.7833 11.3333 23V24.6666H24.6667V23C24.6667 20.7833 20.225 19.6666 18 19.6666Z"
        fill={color}
      />
    </Svg>
  );
}