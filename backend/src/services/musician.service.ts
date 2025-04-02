import { FilterQuery } from "mongoose";

import MusicianModel, { MusicianDocument } from "../models/musician.model";
import { HttpCode } from "@joytify/shared-types/constants";
import { GetMusicianIdRequest } from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

// get musician ID service
export const getMusicianId = async (data: GetMusicianIdRequest) => {
  const { musician: name, type, createIfAbsent } = data;

  let findQuery: FilterQuery<MusicianDocument> = { name };

  // find target musician if exist
  let musician = await MusicianModel.findOne(findQuery);

  // if not found, create it
  if (!musician && createIfAbsent) {
    musician = await MusicianModel.create({ ...findQuery, roles: type });

    appAssert(musician, INTERNAL_SERVER_ERROR, "Failed to create musician");
  }

  // if musician still not found, return error
  appAssert(musician, NOT_FOUND, "Musician is not found");

  // if the musician exists and the type is provided, add the type to the musician's roles property.
  // use $addToSet to avoid adding duplicate values to the roles array.
  musician = await MusicianModel.findByIdAndUpdate(
    musician._id,
    { $addToSet: { roles: type } },
    { new: true }
  );

  appAssert(musician, INTERNAL_SERVER_ERROR, "Failed to push type to roles prop");

  // otherwise, return musician id
  return { id: musician._id };
};
