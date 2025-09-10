import { LabelOptionsType, RefactorInputLabelResponse } from "@joytify/types/types";
import { OptionType } from "../components/multi-select-input-box.component";

export const getLabelOptions = (
  labels: RefactorInputLabelResponse | undefined,
  type: LabelOptionsType
) => {
  if (!labels) return { type, labels: { defaults: [], created: [] } };

  return {
    type,
    labels: labels
      ? {
          defaults: labels.default?.[type as keyof typeof labels.default] || null,
          created: labels.created?.[type as keyof typeof labels.created] || null,
        }
      : null,
  } as OptionType;
};
