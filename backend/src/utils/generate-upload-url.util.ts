import { nanoid } from "nanoid";

import s3 from "../config/aws-s3.config";
import { AWS_BUCKET_NAME } from "../constants/env-validate.constant";
import { FileExtension, UploadFolder } from "../constants/aws-type.constant";

type Params = {
  subfolder?: UploadFolder | undefined;
  extension: FileExtension | undefined;
  nanoID?: string;
};

const generateUploadUrl = async ({
  subfolder,
  extension,
  nanoID = "",
}: Params) => {
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

export default generateUploadUrl;
