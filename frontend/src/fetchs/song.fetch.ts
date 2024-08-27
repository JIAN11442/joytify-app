import { nanoid } from "nanoid";

import API from "../config/api-client.config";
import { DefaultsSongType } from "../constants/form-default-data.constant";
import { uploadFileToAws } from "./upload.fetch";

// upload song data to mongodb
export const createSongData = async (data: DefaultsSongType) => {
  const nanoID = nanoid();

  const { songFile, imageFile, ...params } = data;

  const songUrl = await uploadFileToAws({
    subfolder: "songs",
    extension: ".mp3",
    file: songFile?.[0] as File,
    nanoID,
  });

  const imageUrl = await uploadFileToAws({
    subfolder: "images",
    extension: ".png",
    file: imageFile?.[0] as File,
    nanoID,
  });

  return API.post("/song/create", { ...params, songUrl, imageUrl });
};

// get all songs
export const getAllSongs = async () => {};
