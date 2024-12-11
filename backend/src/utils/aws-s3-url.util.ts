import { nanoid } from "nanoid";

import s3 from "../config/aws-s3.config";
import { AWS_BUCKET_NAME } from "../constants/env-validate.constant";
import { FileExtension, UploadFolder } from "../constants/aws.constant";
import awsUrlParser from "./aws-url-parser.util";

type generateUrlParams = {
  subfolder?: UploadFolder | undefined;
  extension: FileExtension | undefined;
  nanoID?: string;
};

export const generateUploadUrl = async ({
  subfolder,
  extension,
  nanoID = "",
}: generateUrlParams) => {
  try {
    const date = new Date();
    const fileName = `${
      nanoID ? nanoID : nanoid()
    }-${date.getTime()}${extension}`;
    const uploadFilePath = subfolder ? `${subfolder}/${fileName}` : fileName;

    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: uploadFilePath,
      Expires: 60, // signed URL will expire after 60 seconds
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    return uploadUrl;
  } catch (error) {
    console.log(error);
  }
};

export const deleteAwsFileUrl = async (awsS3Key: string) => {
  try {
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: awsS3Key,
    };

    // delete AWS file url
    await s3.deleteObject(params).promise();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const deleteAwsFileUrlOnModel = async (awsUrl: string) => {
  const { mainFolder, awsS3Key } = awsUrlParser(awsUrl);

  if (mainFolder !== "defaults") {
    await deleteAwsFileUrl(awsS3Key);
  }
};
