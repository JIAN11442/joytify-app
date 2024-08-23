import { RequestHandler } from "express";

import generateUploadUrl from "../utils/generate-upload-url.util";
import { awsSignedSchema } from "../schemas/aws.schema";
import { CREATED } from "../constants/http-code.constant";

export const getAwsSignedUrl: RequestHandler = async (req, res, next) => {
  try {
    const { subfolder, extension } = awsSignedSchema.parse(req.body);

    // Generate signed URL and return it to the client
    generateUploadUrl({ subfolder, extension })
      .then((url) => res.status(CREATED).json({ uploadUrl: url }))
      .catch((error) => {
        console.log(error.message);
      });
  } catch (error) {
    next(error);
  }
};
