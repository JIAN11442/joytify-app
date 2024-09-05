import { z } from "zod";
import { FileExtension, UploadFolder } from "../constants/aws-type.constant";

export const awsSignedSchema = z.object({
  subfolder: z.nativeEnum(UploadFolder).optional(),
  extension: z.nativeEnum(FileExtension).optional(),
  nanoID: z.string().length(21).optional(),
});
