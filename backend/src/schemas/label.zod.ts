import { z } from "zod";
import { stringZodSchema } from "./util.zod";
import LabelOptions from "../constants/label.constant";

export const defaultLabelZodSchema = z.object({
  type: z.nativeEnum(LabelOptions),
  createIfAbsent: z.boolean().optional(),
});

export const labelZodSchema = defaultLabelZodSchema.extend({
  label: stringZodSchema.min(0),
});

export const labelsZodSchema = defaultLabelZodSchema.extend({
  labels: z.array(stringZodSchema.min(0)).optional(),
});
