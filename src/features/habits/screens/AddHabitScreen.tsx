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
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing, Radius } from "../../../shared/values/spacing";
import { addHabit } from "../api/habitsApi";
import { ALL_HABITS_PARAMS, habitKeys } from "../api/habitQueries";
import type { Habit } from "../types/habit";
import SegmentedTabs from "../../../shared/components/SegmentedTabs";
import AppButton from "../../../shared/components/AppButton";
import { required, noDuplicates, validateString } from "../../../shared/utils/validator";

const FREQUENCY_OPTIONS = ["Daily", "Weekly"] as const;

type FrequencyOption = (typeof FREQUENCY_OPTIONS)[number];

// Validates form state locally and sends valid habits through a React Query mutation.
export default function AddHabitScreen() {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const addHabitMutation = useMutation({
    mutationFn: addHabit,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      Keyboard.dismiss();
      router.back();
    },
    onError: () => setError("Could not add habit. Please try again."),
  });

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("Daily");
  const [error, setError] = useState<string | undefined>(undefined);

  // Runs the existing validation before starting the add-habit mutation.
  const handleSave = (): void => {
    const habits =
      queryClient.getQueryData<Habit[]>(
        habitKeys.list(ALL_HABITS_PARAMS),
      ) ?? [];
    const validationError = validateString(name, [
      (value) => required(value, "Name"),
      (value) => noDuplicates(value, habits.map((h) => h.name), "Habit"),
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    addHabitMutation.mutate({
      name,
      frequency: frequency === "Daily" ? "daily" : "weekly",
    });
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

            <AppButton
              text="Save"
              onPress={handleSave}
              isLoading={addHabitMutation.isPending}
            />

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
