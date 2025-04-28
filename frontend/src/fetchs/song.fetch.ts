import { nanoid } from "nanoid";

import { uploadFileToAws } from "./aws.fetch";
import { getMusicianId } from "./musician.fetch";
import { MusicianOptions, FileExtension, UploadFolder } from "@joytify/shared-types/constants";
import { SongResponse, RefactorSongResponse } from "@joytify/shared-types/types";
import { DefaultSongForm } from "../types/form.type";
import getAudioDuration from "../utils/get-audio-duration.util";
import API from "../config/api-client.config";

// create song data
export const createSongData = async (params: DefaultSongForm): Promise<SongResponse> => {
  const nanoID = nanoid();

  const { songFile, imageFile, artist, lyricists, composers, ...rest } = params;

  const { ARTIST, LYRICIST, COMPOSER } = MusicianOptions;

  let duration = 0;
  let imageUrl = undefined;
  const musicianParams: { [key: string]: string | string[] } = {};

  const file = songFile?.[0] as File;
  const audio = new Audio(URL.createObjectURL(file));

  // get song duration
  try {
    duration = await getAudioDuration(audio);
  } catch (error) {
    console.log("Failed to get audio duration", error);
  }

  // get song url from AWS
  const songUrl = await uploadFileToAws({
    subfolder: UploadFolder.SONGS_MP3,
    extension: FileExtension.MP3,
    file: songFile?.[0] as File,
    nanoID,
  });

  // get song image url from AWS
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
    { name: "artist", musicians: artist, type: ARTIST },
    { name: "lyricists", musicians: lyricists, type: LYRICIST },
    { name: "composers", musicians: composers, type: COMPOSER },
  ];

  // and return them as a single object
  for (const { name, musicians, type } of propsNeedGetIds) {
    if (musicians) {
      try {
        if (Array.isArray(musicians)) {
          musicianParams[name] = [];

          for (const musician of musicians) {
            const id = await getMusicianId({ musician, type, createIfAbsent: true });

            musicianParams[name].push(id);
          }
        } else {
          musicianParams[name] = await getMusicianId({
            musician: musicians,
            type,
            createIfAbsent: true,
          });
        }
      } catch (error) {
        console.error(`failed to get ${name} IDs:`, error);
      }
    }
  }

  // finally, fetch the request API
  return API.post("/song/create", {
    ...rest,
    ...musicianParams,
    ...(imageUrl ? { imageUrl } : {}),
    songUrl,
    duration,
  });
};

// get all songs
export const getAllSongs = (): Promise<RefactorSongResponse[]> => API.get("/song/");

// get song by id
export const getSongById = (id: string): Promise<RefactorSongResponse> => API.get(`/song/${id}`);
