import z from "zod";

export const collectionPaleteeZodSchema = z.enum([
  "song",
  "album",
  "musician",
  "playlist",
  "label",
]);
