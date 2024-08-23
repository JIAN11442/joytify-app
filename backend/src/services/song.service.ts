import { nanoid } from "nanoid";
import { INTERNAL_SERVER_ERROR } from "../constants/http-code.constant";
import SongModel from "../models/song.model";
import { songSchemaType } from "../schemas/song.schema";
import appAssert from "../utils/app-assert.util";

interface createParams extends songSchemaType {
  userId: string;
}

export const createNewSong = async (data: createParams) => {
  // const song = await SongModel.create({
  //   ...data,
  //   userId: data.userId,
  // });

  // appAssert(song, INTERNAL_SERVER_ERROR, "Failed to create song");

  return {};
};
