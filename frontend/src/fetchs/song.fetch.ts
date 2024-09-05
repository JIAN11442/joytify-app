import { nanoid } from "nanoid";

import API from "../config/api-client.config";
import { uploadFileToAws } from "./upload.fetch";
import { DefaultsSongType } from "../constants/form-default-data.constant";
import { FileExtension, UploadFolder } from "../constants/aws-type.constant";
import { timeoutForEventListener } from "../lib/timeout.lib";

// upload song data to mongodb
export const createSongData = async (data: DefaultsSongType) => {
  const nanoID = nanoid();

  const { songFile, imageFile, ...params } = data;

  let duration = 0;

  const file = songFile?.[0] as File;
  const audio = new Audio(URL.createObjectURL(file));

  timeoutForEventListener(
    audio,
    "loadedmetadata",
    () => (duration = audio.duration)
  );

  const songUrl = await uploadFileToAws({
    subfolder: UploadFolder.SONGS_MP3,
    extension: FileExtension.MP3,
    file: songFile?.[0] as File,
    nanoID,
  });

  const imageUrl = await uploadFileToAws({
    subfolder: UploadFolder.SONGS_IMAGE,
    extension: FileExtension.PNG,
    file: imageFile?.[0] as File,
    nanoID,
  });

  return API.post("/song/create", { ...params, songUrl, duration, imageUrl });
};
