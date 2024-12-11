import { z } from "zod";
import LabelOptions from "../constants/label.constant";

export const stringSchema = z.string().min(0).max(255);

export const defaultLabelSchema = z.object({
  type: z.nativeEnum(LabelOptions),
  createIfAbsent: z.boolean().optional(),
});

export const labelSchema = defaultLabelSchema.extend({
  label: stringSchema,
});

export const labelsSchema = defaultLabelSchema.extend({
  labels: z.array(stringSchema).optional(),
});
