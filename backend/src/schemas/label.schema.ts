import { z } from "zod";
import LabelOptions from "../constants/label-type.constant";
import { verificationCodeSchema } from "./auth.schema";

export const stringSchema = z.string().min(0).max(255);

export const labelSchema = z.object({
  label: stringSchema,
  type: z.nativeEnum(LabelOptions),
});
