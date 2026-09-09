import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { useTheme } from "../../../src/core/theme/ThemeContext";
import { getTextStyles } from "../../../src/core/values/textStyles";
import { Spacing, Radius } from "../../../src/core/values/spacing";
import { useHabits } from "../../../src/features/habits/context/HabitsContext";
import SegmentedTabs from "../../../src/components/SegmentedTabs";
import AppButton from "../../../src/components/AppButton";

const FREQUENCY_OPTIONS = ["Daily", "Weekly"] as const;

type FrequencyOption = (typeof FREQUENCY_OPTIONS)[number];

export default function AddHabitScreen() {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const { habits, addHabit } = useHabits();

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("Daily");
  const [error, setError] = useState<string | undefined>(undefined);

  const validate = (): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return false;
    }
    if (
      habits.some(
        (h) => h.name.trim().toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setError("Habit already exists");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    addHabit(name, frequency === "Daily" ? "daily" : "weekly");
    Keyboard.dismiss();
    router.back();
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingTop: insets.top + Spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[textStyles.heading1, styles.title]}>
              Add Habit
            </Text>

            <View style={styles.field}>
              <Text style={textStyles.overline}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceElevated,
                    color: colors.textPrimary,
                    borderColor: error ? colors.error : colors.border,
                  },
                ]}
                placeholder="Enter habit name"
                placeholderTextColor={colors.textDisabled}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError(undefined);
                }}
              />
              {error && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={textStyles.overline}>Frequency</Text>
              <SegmentedTabs
                options={[...FREQUENCY_OPTIONS]}
                value={frequency}
                onChange={(value) => setFrequency(value as FrequencyOption)}
              />
            </View>

            <AppButton text="Save" onPress={handleSave} />

            <AppButton
              text="Cancel"
              variant="secondary"
              onPress={() => router.back()}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  field: {
    gap: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "400",
  },
});
