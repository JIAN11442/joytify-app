import { RequestHandler } from "express";

import {
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../constants/http-code.constant";
import { awsFileUrlSchema, awsSignedSchema } from "../schemas/aws.schema";

import appAssert from "../utils/app-assert.util";
import awsUrlParser from "../utils/aws-url-parser.util";
import { deleteAwsFileUrl, generateUploadUrl } from "../utils/aws-s3-url.util";

// get aws signed url
export const getAwsSignedUrlHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { subfolder, extension, nanoID } = awsSignedSchema.parse(req.body);

    // Generate signed URL and return it to the client
    generateUploadUrl({ subfolder, extension, nanoID })
      .then((url) => res.status(CREATED).json({ uploadUrl: url }))
      .catch((error) => {
        console.log(error.message);
      });
  } catch (error) {
    next(error);
  }
};

// delete aws file url
export const deleteAwsFileUrlHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { awsUrl } = req.body;
    const validatedAwsUrl = awsFileUrlSchema.parse(awsUrl);

    // get aws s3 key
    const { awsS3Key } = awsUrlParser(validatedAwsUrl);

    // delete aws file
    const deletedAwsUrl = await deleteAwsFileUrl(awsS3Key);

    appAssert(
      deletedAwsUrl,
      INTERNAL_SERVER_ERROR,
      "Failed to delete aws file"
    );

    return res.status(OK).json({ message: "AWS file deleted successfully" });
  } catch (error) {
    next(error);
  }
};
