import z from "zod";

export const userPreferencesCookieSchema = z.object({
  collapseSidebar: z.boolean().optional(),
});
