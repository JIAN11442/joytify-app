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

  const {
    songFile,
    imageFile,
    artist,
    lyricists,
    composers,
    genres,
    tags,
    ...params
  } = data;

  let duration = 0;
  let imageUrl = undefined;

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
  if (imageFile?.length) {
    imageUrl = await uploadFileToAws({
      subfolder: UploadFolder.SONGS_IMAGE,
      extension: FileExtension.PNG,
      file: imageFile?.[0] as File,
      nanoID,
    });
  }

  // collect label IDs for various categories
  const labelsNeedGetIds = [
    { name: "artist", labels: artist, type: LabelOptions.ARTIST },
    { name: "lyricists", labels: lyricists, type: LabelOptions.LYRICIST },
    { name: "composers", labels: composers, type: LabelOptions.COMPOSER },
    { name: "genres", labels: genres, type: LabelOptions.GENRE },
    { name: "tags", labels: tags, type: LabelOptions.TAG },
  ];

  // and return them as a single object.
  const labelParams = await Promise.all(
    labelsNeedGetIds.map(async ({ name, labels, type }) => {
      if (labels && labels.length) {
        try {
          const ids = await getLabelIds({ labels, type, createIfAbsent: true });
          return { [name]: ids };
        } catch (error) {
          console.error(`failed to get ${name} label IDs:`, error);
          return {};
        }
      }
      return {};
    })
  ).then((results) => Object.assign({}, ...results));

  // finally, fetch the request API
  return API.post("/song/create", {
    ...params,
    ...labelParams,
    ...(imageUrl ? { imageUrl } : {}),
    songUrl,
    duration,
  });
};

// get song by id
export const getSongById = (id: string): Promise<resSong> =>
  API.get(`/song/${id}`);
