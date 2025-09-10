import { RequestHandler } from "express";

import { awsFileUrlZodSchema, awsSignedZodSchema } from "../schemas/aws.zod";
import { HttpCode } from "@joytify/types/constants";
import { deleteAwsFileUrl, generateUploadUrl } from "../utils/aws-s3-url.util";
import awsUrlParser from "../utils/aws-url-parser.util";
import appAssert from "../utils/app-assert.util";

const { OK, CREATED, INTERNAL_SERVER_ERROR } = HttpCode;

// get AWS signed url
export const getAwsSignedUrlHandler: RequestHandler = async (req, res, next) => {
  try {
    const { subfolder, extension, nanoID } = awsSignedZodSchema.parse(req.body);

    const uploadUrl = await generateUploadUrl({ subfolder, extension, nanoID });

    return res.status(CREATED).json({ uploadUrl });
  } catch (error) {
    next(error);
  }
};

// delete AWS file url
export const deleteAwsFileUrlHandler: RequestHandler = async (req, res, next) => {
  try {
    const { awsUrl } = req.body;
    const validatedAwsUrl = awsFileUrlZodSchema.parse(awsUrl);

    // get AWS S3 key
    const { awsS3Key } = awsUrlParser(validatedAwsUrl);

    // delete AWS file
    const deletedAwsUrl = await deleteAwsFileUrl(awsS3Key);

    appAssert(deletedAwsUrl, INTERNAL_SERVER_ERROR, "Failed to delete AWS file");

    return res.status(OK).json({ message: "AWS file deleted successfully" });
  } catch (error) {
    next(error);
  }
};
