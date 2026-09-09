import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useState } from "react";
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
import SegmentedTabs from "../components/SegmentedTabs";
import CircularProgress from "../components/CircularProgress";

import CalendarIcon from "../assets/icons/calendar.svg";
import ProgressIcon from "../assets/icons/progress.svg";
import TalkToRafiqIcon from "../assets/icons/talk_to_rafiq.svg";
import ArrowIcon from "../assets/icons/arrow.svg";
import RelapseIcon from "../assets/icons/relapse.svg";
import ProgressChartIcon from "../assets/icons/progress_chart.svg";
import AppButton from "../components/AppButton";
import { router } from "expo-router";

// Static, screen-owned demo data — this screen isn't wired to an API yet.
const ANALYTICS_TABS = ["Overview", "Urges", "Insights"] as const;
type AnalyticsTab = (typeof ANALYTICS_TABS)[number];

const DAYS_CLEAN = 15;
const GOAL_DAYS = 90;
const GOAL_DATE_LABEL = "Jun 13";

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("Overview");

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
        <Text style={[textStyles.heading1, styles.title]}>Analytics</Text>

        <SegmentedTabs
          options={[...ANALYTICS_TABS]}
          value={activeTab}
          onChange={(value) => setActiveTab(value as AnalyticsTab)}
        />

        <Card style={styles.ringCard}>
          <CircularProgress
            size={200}
            strokeWidth={10}
            progress={(DAYS_CLEAN / GOAL_DAYS) * 100}
            trackColor={colors.border}
            progressColor={colors.primary}
          >
            <Text style={[textStyles.overline, styles.ringLabel]}>
              Days Clean
            </Text>
            <View style={styles.ringValueRow}>
              <Text style={[textStyles.heading1, styles.ringValue]}>
                {DAYS_CLEAN}
              </Text>
              <Text
                style={[textStyles.heading2, { color: colors.textSecondary }]}
              >
                d
              </Text>
              
            </View>
            <Badge variant="success" style={styles.steadfastBadge}>
              <ProgressIcon width={14} height={14} />
              <Text
                style={[
                  textStyles.caption,
                  styles.badgeText,
                  { color: colors.success },
                ]}
              >
                STEADFAST
              </Text>
            </Badge>
          </CircularProgress>

          <Badge variant="warning" style={styles.goalBadge}>
            <CalendarIcon width={14} height={14} />
            <Text
              style={[
                textStyles.caption,
                styles.badgeText,
                { color: colors.warning },
              ]}
            >
              90-day goal: {GOAL_DATE_LABEL}
            </Text>
          </Badge>
        </Card>

        <Card style={styles.rafiqCard}>
          <ListRow
            icon={<TalkToRafiqIcon width={22} height={22} />}
            title="Talk to Rafiq"
            subtitle="Your AI recovery coach"
            trailing={<ArrowIcon width={18} height={18} />}
          />
        </Card>

        <Card style={styles.progressCard} title="Progress">
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <RelapseIcon width={10} height={10} />
              <Text style={[textStyles.caption, styles.legendLabel]}>
                Relapse
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendLine, { backgroundColor: colors.primary }]}
              />
              <Text style={[textStyles.caption, styles.legendLabel]}>
                Progress
              </Text>
            </View>
          </View>

          {/* Pre-drawn static chart asset — the shape of this specific 15-day
            streak history is design content, not something derived from
            live data yet, so it's rendered as-is rather than a custom
            chart-drawing component. */}
          <ProgressChartIcon width="100%" height={140} />
        </Card>

        <Card title="Your Journey" subtitle="5 streaks tracked">
          <Text style={[textStyles.caption, styles.journeyNote]}>
            Past streak lengths are approximate.
          </Text>
        </Card>
        <AppButton
          text="Open Details"
          onPress={() => router.push("/(tabs)/analytics/details")}
        />
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
    // paddingTop is set dynamically per-screen from useSafeAreaInsets() so
    // content clears the status bar/notch — the gradient behind it still
    // fills the full screen edge-to-edge.
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
    // Extra bottom padding so content can scroll clear of the floating tab bar.
    paddingBottom: Spacing.xxl * 2,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  ringCard: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  ringLabel: {
    marginBottom: Spacing.xs,
  },
  ringValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  ringValue: {
    marginRight: 2,
  },
  steadfastBadge: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
    // Badge hardcodes alignSelf: "flex-start" internally (fine for badges
    // sitting inside a row/list), which overrides the parent's
    // alignItems: "center" here. Since Badge applies its `style` prop last,
    // overriding alignSelf from the caller re-centers it without touching
    // Badge.tsx.
    alignSelf: "center",
  },
  goalBadge: {
    gap: Spacing.xs,
    alignSelf: "center",
  },
  badgeText: {
    fontWeight: "600",
  },
  rafiqCard: {
    padding: Spacing.sm,
  },
  progressCard: {
    gap: Spacing.md,
  },
  legendRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  legendLabel: {
    marginLeft: 2,
  },
  journeyNote: {
    marginTop: Spacing.xs,
  },
});
