import z from "zod";
import { SupportedLocale } from "@joytify/shared-types/constants";

export const userPreferencesCookieSchema = z.object({
  sidebarCollapsed: z.boolean().optional(),
  locale: z.nativeEnum(SupportedLocale).optional(),
});
