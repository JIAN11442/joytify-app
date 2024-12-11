import { z } from "zod";

import {
  AWS_BUCKET_NAME,
  AWS_REGION,
} from "../constants/env-validate.constant";
import { FileExtension, UploadFolder } from "../constants/aws.constant";
import awsUrlParser from "../utils/aws-url-parser.util";

const baseRootUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`;
const fileRegex = /^[a-zA-Z0-9_-]{21}-\d{13}$/;

export const awsSignedSchema = z.object({
  subfolder: z.nativeEnum(UploadFolder).optional(),
  extension: z.nativeEnum(FileExtension).optional(),
  nanoID: z.string().length(21).optional(),
});

export const awsFileUrlSchema = z.string().refine((url) => {
  try {
    // parse AWS url to get each part of data
    const { rootPath, folderPath, file, extension } = awsUrlParser(url);

    // validate root path
    if (rootPath !== baseRootUrl) return false;

    // validate folder path
    if (!z.nativeEnum(UploadFolder).safeParse(folderPath).success) return false;

    // validate file name
    if (!file || !fileRegex.test(file)) return false;

    // validate extension
    if (!z.nativeEnum(FileExtension).safeParse(`.${extension}`).success)
      return false;

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
});
