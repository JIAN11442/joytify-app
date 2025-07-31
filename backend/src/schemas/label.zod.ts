import { z } from "zod";
import { LabelOptions } from "@joytify/shared-types/constants";
import { stringZodSchema } from "./util.zod";

export const defaultLabelZodSchema = z.object({
  type: z.nativeEnum(LabelOptions),
  createIfAbsent: z.coerce.boolean().optional(),
});

export const createLabelZodSchema = defaultLabelZodSchema.extend({
  label: stringZodSchema.min(0),
});

export const getLabelsZodSchema = z.object({
  types: z.preprocess(
    (val: unknown) => {
      if (typeof val === "string") {
        return val.split(",").filter(Boolean);
      } else if (Array.isArray(val)) {
        return val;
      } else {
        return [];
      }
    },
    z.array(z.nativeEnum(LabelOptions)).optional()
  ),
  sortBySequence: z
    .union([z.literal("true").transform(() => true), z.literal("false").transform(() => false)])
    .optional(),
});

export const getLabelIdZodSchema = defaultLabelZodSchema.extend({
  default: z.coerce.boolean().optional(),
  label: stringZodSchema.min(0),
});

export const labelTypesZodSchema = z.array(z.nativeEnum(LabelOptions));
