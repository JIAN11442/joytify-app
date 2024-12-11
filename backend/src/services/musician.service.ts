import { FilterQuery } from "mongoose";
import MusicianModel, { MusicianDocument } from "../models/musician.model";
import appAssert from "../utils/app-assert.util";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import { MusicianType } from "../constants/musician.constant";

type getMusicianIdParams = {
  name: string;
  type: MusicianType;
  createIfAbsent?: boolean;
};

// get musician ID service
export const getMusicianId = async (data: getMusicianIdParams) => {
  const { name, type, createIfAbsent } = data;

  let findQuery: FilterQuery<MusicianDocument> = { name };

  // find target musician if exist
  let musician = await MusicianModel.findOne(findQuery);

  // if not found, create it
  if (!musician && createIfAbsent) {
    // if hava type, advanced findQuery push to roles props
    if (type) {
      findQuery = { ...findQuery, roles: type };
    }

    // then, create that
    musician = await MusicianModel.create(findQuery);

    appAssert(musician, INTERNAL_SERVER_ERROR, "Failed to create musician");
  }

  // if musician still not found, return error
  appAssert(musician, NOT_FOUND, "Musician is not found");

  // if the musician exists and the type is provided, add the type to the musician's roles property.
  // use $addToSet to avoid adding duplicate values to the roles array.
  if (type) {
    musician = await MusicianModel.findByIdAndUpdate(
      musician._id,
      { $addToSet: { roles: type } },
      { new: true }
    );

    appAssert(
      musician,
      INTERNAL_SERVER_ERROR,
      "Failed to push type to roles prop"
    );
  }

  // otherwise, return musician id
  return { id: musician._id };
};
