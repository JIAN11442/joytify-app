import { nanoid } from "nanoid";

import { DefaultsSongType } from "../constants/form-default-data.constant";
import { FileExtension, UploadFolder } from "../constants/aws-type.constant";
import MusicianOptions from "../constants/musician-type.constant";
import { resSong } from "../constants/data-type.constant";
import { getMusicianIds } from "./musician.fetch";
import { uploadFileToAws } from "./aws.fetch";
import API from "../config/api-client.config";
import getAudioDuration from "../utils/get-audio-duration.util";

// create song data
export const createSongData = async (data: DefaultsSongType) => {
  const nanoID = nanoid();

  const { songFile, imageFile, artist, lyricists, composers, ...params } = data;

  let imageUrl = undefined;
  let duration = 0;
  const musicianParams: { [key: string]: string[] } = {};

  const file = songFile?.[0] as File;
  const audio = new Audio(URL.createObjectURL(file));

  // get song duration
  try {
    duration = await getAudioDuration(audio);
  } catch (error) {
    console.log("Failed to get audio duration", error);
  }

  // get song url from aws
  const songUrl = await uploadFileToAws({
    subfolder: UploadFolder.SONGS_MP3,
    extension: FileExtension.MP3,
    file: songFile?.[0] as File,
    nanoID,
  });

  // get song image url from aws
  if (imageFile?.length) {
    imageUrl = await uploadFileToAws({
      subfolder: UploadFolder.SONGS_IMAGE,
      extension: FileExtension.PNG,
      file: imageFile?.[0] as File,
      nanoID,
    });
  }

  // collect musician IDs for various categories
  const propsNeedGetIds = [
    { name: "artist", musicians: artist, type: MusicianOptions.ARTIST },
    { name: "lyricists", musicians: lyricists, type: MusicianOptions.LYRICIST },
    { name: "composers", musicians: composers, type: MusicianOptions.COMPOSER },
  ];

  // and return them as a single object.
  for (const { name, musicians, type } of propsNeedGetIds) {
    if (musicians && musicians.length) {
      try {
        const ids = await getMusicianIds({
          musicians,
          type,
          createIfAbsent: true,
        });

        musicianParams[name] = ids;
      } catch (error) {
        console.error(`failed to get ${name} IDs:`, error);
      }
    }
  }

  // finally, fetch the request API
  return API.post("/song/create", {
    ...params,
    ...musicianParams,
    ...(imageUrl ? { imageUrl } : {}),
    songUrl,
    duration,
  });
};

// get song by id
export const getSongById = (id: string): Promise<resSong> =>
  API.get(`/song/${id}`);
