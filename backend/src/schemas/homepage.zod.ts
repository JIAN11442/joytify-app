import z from "zod";
import { objectIdZodSchema, pageZodSchema } from "./util.zod";
import { LabelOptions } from "@joytify/types/constants";

export const getPersonalRecommendedItemsZodSchema = z.object({
  page: pageZodSchema,
  songIds: z.array(objectIdZodSchema).optional(),
});

export const getPublicRecommendedItemsZodSchema = z.object({
  page: pageZodSchema,
  type: z.nativeEnum(LabelOptions),
});
