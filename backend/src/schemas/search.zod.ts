import z from "zod";
import { SearchFilterOptions } from "@joytify/types/constants";

export const searchParamsZodSchema = z.object({
  type: z.nativeEnum(SearchFilterOptions),
});

export const searchQueryZodSchema = z.object({
  query: z.string(),
  page: z.coerce.number().min(1).default(1),
});
