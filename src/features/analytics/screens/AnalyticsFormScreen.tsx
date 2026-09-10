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

import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing, Radius } from "../../../shared/values/spacing";
import { useItems } from "../hooks/UseAnalytics";
import { validateFields, required, minLength, FieldErrors } from "../../../shared/utils/validator";

import AppButton from "../../../shared/components/AppButton";

export default function AnalyticsFormScreen() {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const { addItem } = useItems();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSave = () => {
    const newErrors = validateFields(
      { name, category },
      {
        name: [
          (value) => required(value, "Name"),
          (value) => minLength(value, 2, "Name"),
        ],
        category: [
          (value) => required(value, "Category"),
          (value) => minLength(value, 3, "Category"),
        ],
      }
    );
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    addItem({
      name: name.trim(),
      category: category.trim(),
      daysOnPath: 0,
      streakActive: true,
    });

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
              Add New Item
            </Text>

            <View style={styles.field}>
              <Text style={textStyles.overline}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceElevated,
                    color: colors.textPrimary,
                    borderColor: errors.name ? colors.error : colors.border,
                  },
                ]}
                placeholder="Enter item name"
                placeholderTextColor={colors.textDisabled}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.name}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={textStyles.overline}>Category</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceElevated,
                    color: colors.textPrimary,
                    borderColor: errors.category ? colors.error : colors.border,
                  },
                ]}
                placeholder="Enter category"
                placeholderTextColor={colors.textDisabled}
                value={category}
                onChangeText={(text) => {
                  setCategory(text);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                }}
              />
              {errors.category && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.category}
                </Text>
              )}
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
