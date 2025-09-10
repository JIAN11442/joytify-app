import API from "../config/api-client.config";
import { FileExtension, UploadFolder, API_ENDPOINTS } from "@joytify/types/constants";

export interface SignedUrlRequest {
  subfolder?: UploadFolder;
  extension: FileExtension;
  nanoID?: string;
}

interface UploadFileRequest extends SignedUrlRequest {
  file: File;
}

const { AWS } = API_ENDPOINTS;

// get signed url for upload
export const getAwsSignedUrl = async (params: SignedUrlRequest): Promise<{ uploadUrl: string }> =>
  await API.post(`${AWS}/signed-url`, params);

// upload file to AWS S3
export const uploadFileToAws = async (params: UploadFileRequest): Promise<string | null> => {
  // set default img URL
  let url = null;

  // get data
  const { file, subfolder, extension, nanoID } = params;

  // get signed url first
  const { uploadUrl } = await getAwsSignedUrl({ subfolder, extension, nanoID });

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
  await API.delete(`${AWS}/file-url`, { data: { awsUrl } });
