import API from "../config/api-client.config";
import {
  FileExtension,
  UploadFolder,
} from "../constants/argument-type.constant";

interface SignedUrlParams {
  subfolder: UploadFolder;
  extension: FileExtension;
}

interface UploadFileParams extends SignedUrlParams {
  file: File;
}

// upload song data
export const uploadSong = async (data: object = {}) =>
  API.post("/upload/song", data);

// get signed url for upload
export const getSignedUrl = async (
  data: SignedUrlParams
): Promise<{ uploadUrl: string }> => API.post("/aws/get-signed-url", data);

// upload song file to aws s3
export const uploadFileToAws = async (
  data: UploadFileParams
): Promise<string | null> => {
  // set default img URL
  let imgUrl = null;

  // get data
  const { file, subfolder, extension } = data;

  // get signed url first
  const { uploadUrl } = await getSignedUrl({ subfolder, extension });

  // upload file to AWS s3
  // withCredentials is set to false to avoid CORS issue
  // because our s3 bucket cor origin is set to *
  await API.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    withCredentials: false,
  });

  // get the image URL
  imgUrl = uploadUrl.split("?")[0];

  return imgUrl;
};
