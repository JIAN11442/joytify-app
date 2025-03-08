import { FieldErrors, UseFormWatch, Path, FieldValues } from "react-hook-form";

export const isHighlight = <T extends FieldValues>(
  watch: UseFormWatch<T>,
  errors: FieldErrors<T>,
  target: Path<T>
) => {
  const value = watch(target);

  if (typeof value === "string" || Array.isArray(value)) {
    return value.length > 0
      ? errors[target]
        ? "error"
        : "success"
      : undefined;
  }

  return undefined;
};
