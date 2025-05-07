import { FieldNamesMarkedBoolean, FieldValues } from "react-hook-form";

/**
 * Extracts only the modified fields from a form data object based on dirty fields tracking.
 *
 * @template T - Type of the form values object
 * @param {T} value - The complete form data object
 * @param {Partial<Readonly<FieldNamesMarkedBoolean<T>>>} dirtyFields - Object marking which fields have been modified
 * @returns {T} A new object containing only the modified field values
 *
 * @example
 * const formData = { name: "John", email: "john@example.com", age: 25 };
 * const dirtyFields = { name: true, email: true };
 * const modified = getModifiedFormData(formData, dirtyFields);
 * // Result: { name: "John", email: "john@example.com" }
 */

export const getModifiedFormData = <T extends FieldValues>(
  value: T,
  dirtyFields?: Partial<Readonly<FieldNamesMarkedBoolean<T>>>
) => {
  if (!dirtyFields) {
    return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));
  }

  const values = Object.keys(dirtyFields).reduce((acc, field) => {
    acc[field as keyof T] = value[field as keyof T];
    return acc;
  }, {} as T);

  return values;
};
