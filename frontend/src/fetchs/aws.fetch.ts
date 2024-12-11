import API from "../config/api-client.config";
import { FileExtension, UploadFolder } from "../constants/aws.constant";

export interface SignedUrlParams {
  subfolder?: UploadFolder;
  extension: FileExtension;
  nanoID?: string;
}

interface UploadFileParams extends SignedUrlParams {
  file: File;
}

// get signed url for upload
export const getSignedUrl = async (
  data: SignedUrlParams
): Promise<{ uploadUrl: string }> =>
  await API.post("/aws/get-signed-url", data);

// upload file to AWS S3
export const uploadFileToAws = async (
  data: UploadFileParams
): Promise<string | null> => {
  // set default img URL
  let url = null;

  // get data
  const { file, subfolder, extension, nanoID } = data;

  // get signed url first
  const { uploadUrl } = await getSignedUrl({ subfolder, extension, nanoID });

  // upload file to AWS S3
  // withCredentials is set to false to avoid CORS issue
  // because our S3 bucket cor origin is set to *
  await API.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    withCredentials: false,
  });

  // get the image URL
  url = uploadUrl.split("?")[0];

  return url;
};

// delete file from AWS S3
// the request payload must be wrapped in a 'data' object
// because the DELETE method in Axios requires it for sending a request body
export const deleteFileFromAws = async (awsUrl: string) =>
  await API.delete("/aws/delete-file-url", { data: { awsUrl } });
