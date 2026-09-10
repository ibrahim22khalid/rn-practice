export const REQUIRED_MESSAGE = (field: string) => `${field} is required`;

export const MIN_LENGTH_MESSAGE = (field: string, min: number) =>
  `${field} must be at least ${min} characters`;

export const DUPLICATE_MESSAGE = (field: string) => `${field} already exists`;

export function required(value: string, field: string): string | undefined {
  if (!value.trim()) return REQUIRED_MESSAGE(field);
}

export function minLength(
  value: string,
  min: number,
  field: string
): string | undefined {
  if (value.trim().length < min) return MIN_LENGTH_MESSAGE(field, min);
}

export function noDuplicates(
  value: string,
  existingNames: string[],
  field: string
): string | undefined {
  const trimmed = value.trim();
  if (
    existingNames.some(
      (name) => name.trim().toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return DUPLICATE_MESSAGE(field);
  }
}

export function validateString(
  value: string,
  rules: Array<(value: string) => string | undefined>
): string | undefined {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
}

export interface FieldErrors {
  [field: string]: string | undefined;
}

export function validateFields(
  fields: Record<string, string | undefined>,
  validators: Record<string, Array<(value: string) => string | undefined>>
): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of Object.keys(validators)) {
    const error = validateString(fields[field] ?? "", validators[field]);
    if (error) errors[field] = error;
  }
  return errors;
}