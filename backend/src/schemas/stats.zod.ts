import { z } from "zod";
import { objectIdZodSchema } from "./util.zod";

export const getMonthlyStatsZodSchema = z.object({
  userId: objectIdZodSchema,
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
  timezone: z.string().optional(), // 可選的時區參數
});

export type getMonthlyStatsZodSchemaType = z.infer<typeof getMonthlyStatsZodSchema>;
