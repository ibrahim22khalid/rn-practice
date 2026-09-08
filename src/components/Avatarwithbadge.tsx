import { View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../core/theme/ThemeContext";
import { Radius } from "../core/values/spacing";

interface AvatarWithBadgeProps {
  size?: number;
  /** Badge icon shown bottom-right, e.g. the edit_profile.svg icon. */
  badge?: ReactNode;
}

export default function AvatarWithBadge({
  size = 96,
  badge,
}: AvatarWithBadgeProps) {
  const { colors } = useTheme();

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.primary,
          },
        ]}
      >
        {/* Placeholder person silhouette — no dedicated avatar asset was
            provided in assets/icons, so this is built from plain Views as a
            stand-in. Swap for a real avatar/person icon once one exists. */}
        <View style={styles.personWrap}>
          <View
            style={[
              styles.personHead,
              { backgroundColor: colors.primary, borderRadius: size / 5 },
            ]}
          />
          <View
            style={[
              styles.personBody,
              {
                backgroundColor: colors.primary,
                width: size * 0.62,
                height: size * 0.4,
                borderTopLeftRadius: size * 0.31,
                borderTopRightRadius: size * 0.31,
              },
            ]}
          />
        </View>
      </View>

      {badge && (
        <View
          style={[
            styles.badgeWrap,
            { backgroundColor: colors.primary, borderColor: colors.background },
          ]}
        >
          {badge}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  personWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    height: "100%",
  },
  personHead: {
    width: "34%",
    aspectRatio: 1,
    marginBottom: 4,
  },
  personBody: {},
  badgeWrap: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});