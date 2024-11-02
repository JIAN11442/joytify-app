import { nanoid } from "nanoid";

import { getLabelIds } from "./label.fetch";
import { uploadFileToAws } from "./aws.fetch";
import { DefaultsSongType } from "../constants/form-default-data.constant";
import { FileExtension, UploadFolder } from "../constants/aws-type.constant";
import { resSong } from "../constants/data-type.constant";
import LabelOptions from "../constants/label-type.constant";
import { timeoutForEventListener } from "../lib/timeout.lib";
import API from "../config/api-client.config";

// create song data
export const createSongData = async (data: DefaultsSongType) => {
  const nanoID = nanoid();

  const { songFile, imageFile, artist, lyricists, composers, ...params } = data;

  let duration = 0;
  let imageUrl = null;

  const file = songFile?.[0] as File;
  const audio = new Audio(URL.createObjectURL(file));

  // get song duration
  timeoutForEventListener(
    audio,
    "loadedmetadata",
    () => (duration = audio.duration)
  );

  // get song url from aws
  const songUrl = await uploadFileToAws({
    subfolder: UploadFolder.SONGS_MP3,
    extension: FileExtension.MP3,
    file: songFile?.[0] as File,
    nanoID,
  });

  // get song image url from aws
  if (imageFile) {
    imageUrl = await uploadFileToAws({
      subfolder: UploadFolder.SONGS_IMAGE,
      extension: FileExtension.PNG,
      file: imageFile?.[0] as File,
      nanoID,
    });
  }

  // get artist ids
  const artistIds = await getLabelIds({
    labels: artist,
    type: LabelOptions.ARTIST,
    createIfAbsent: true,
  });

  // get lyricists ids
  const lyricistIds = await getLabelIds({
    labels: lyricists,
    type: LabelOptions.LYRICIST,
    createIfAbsent: true,
  });

  // get composer ids
  const composerIds = await getLabelIds({
    labels: composers,
    type: LabelOptions.COMPOSER,
    createIfAbsent: true,
  });

  return API.post("/song/create", {
    ...params,
    artist: artistIds,
    lyricists: lyricistIds,
    composers: composerIds,
    songUrl,
    duration,
    ...(imageUrl ? { imageUrl } : {}),
  });
};

// get song by id
export const getSongById = (id: string): Promise<resSong> =>
  API.get(`/song/${id}`);
