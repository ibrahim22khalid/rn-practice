import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// If this is a bare RN project instead of Expo, swap this import for:
// import LinearGradient from "react-native-linear-gradient";
// (default export instead of named, otherwise the same API).
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "../core/theme/ThemeContext";
import { getTextStyles } from "../core/values/textStyles";
import { Spacing } from "../core/values/spacing";

import Card from "../components/Card";
import Badge from "../components/Badge";
import ListRow from "../components/ListRow";


import EditProfileIcon from "../assets/icons/edit_profile.svg";
import SmallStreakIcon from "../assets/icons/small_streak.svg";
import SeedHopeIcon from "../assets/icons/seed_hope.svg";
import CupIcon from "../assets/icons/cup.svg";
import ResetIcon from "../assets/icons/reset.svg";
import RecoveryCodeIcon from "../assets/icons/recovery_code.svg";
import AmmanaIcon from "../assets/icons/ammana.svg";
import SupportIcon from "../assets/icons/support.svg";
import HeartIcon from "../assets/icons/heart.svg";
import ArrowIcon from "../assets/icons/arrow.svg";
import AvatarWithBadge from "../components/Avatarwithbadge";
import MilestoneCircle from "../components/Milestonecircle";
import StatTile from "../components/Stattile";

// Static demo data — this screen isn't wired to an API yet.
const USER_NAME = "HEMA";
const MILESTONE_DAYS = [1, 3, 7, 14, 21, 30];
const STATS = { current: 0, best: 5, resets: 5 };

export default function ProfileScreen() {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <AvatarWithBadge
          size={100}
          badge={<EditProfileIcon width={14} height={14} />}
        />
        <Text style={[textStyles.heading1, styles.name]}>{USER_NAME}</Text>

        <View style={styles.badgeRow}>
          <Badge variant="warning" style={styles.headerBadge}>
            <SmallStreakIcon width={14} height={14} />
            <Text
              style={[textStyles.caption, styles.badgeText, { color: colors.warning }]}
            >
              {STATS.current} day streak
            </Text>
          </Badge>
          <Badge variant="success" style={styles.headerBadge}>
            <SeedHopeIcon width={14} height={14} />
            <Text
              style={[textStyles.caption, styles.badgeText, { color: colors.success }]}
            >
              Seed of Hope
            </Text>
          </Badge>
        </View>
      </View>

      <View>
        <Text style={[textStyles.overline, styles.sectionLabel]}>Milestones</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MILESTONE_DAYS.map((day) => (
            <MilestoneCircle key={day} day={day} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.statsRow}>
        <StatTile
          icon={<SmallStreakIcon width={20} height={20} />}
          value={STATS.current}
          label="Current"
        />
        <StatTile
          icon={<CupIcon width={20} height={20} />}
          value={STATS.best}
          label="Best"
        />
        <StatTile
          icon={<ResetIcon width={20} height={20} />}
          value={STATS.resets}
          label="Resets"
        />
      </View>

      <View>
        <Text style={[textStyles.overline, styles.sectionLabel]}>Account</Text>
        <Card style={styles.listCard}>
          <ListRow
            icon={<EditProfileIcon width={18} height={18} />}
            title="Edit Profile"
            subtitle="Name, age, gender"
            trailing={<ArrowIcon width={16} height={16} />}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ListRow
            icon={<RecoveryCodeIcon width={18} height={18} />}
            title="Recovery Code"
            subtitle="Tap to reveal · Secured with biometrics"
            trailing={<ArrowIcon width={16} height={16} />}
          />
        </Card>
      </View>

      <View>
        <Text style={[textStyles.overline, styles.sectionLabel]}>Subscription</Text>
        <Card style={styles.listCard}>
          <ListRow
            icon={<AmmanaIcon width={18} height={18} />}
            title="Amanah Access"
            subtitle="Full access granted on trust"
            trailing={<HeartIcon width={18} height={18} />}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ListRow
            icon={<SupportIcon width={18} height={18} />}
            title="Support Pure Path"
            subtitle="Help keep the app running for everyone"
            trailing={<ArrowIcon width={16} height={16} />}
          />
        </Card>
      </View>

      {/* Privacy & Security section is only partially visible behind the
          floating tab bar in the reference screenshot (just the header and
          a faded "Privacy Score / Not locked · Stealth on" row), so its row
          layout isn't confidently reproducible from what's given. Header
          included as a placeholder; fill in the row once the full mock is
          available. */}
      <Text style={[textStyles.overline, styles.sectionLabel]}>
        Privacy & Security
      </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    // paddingTop is set dynamically from useSafeAreaInsets() above.
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    alignItems: "center",
  },
  name: {
    marginTop: Spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  headerBadge: {
    gap: Spacing.xs,
  },
  badgeText: {
    fontWeight: "600",
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  listCard: {
    paddingVertical: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});