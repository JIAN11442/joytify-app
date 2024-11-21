import { RequestHandler } from "express";
import { musicianSchema } from "../schemas/musician.schema";
import { getMusicianId } from "../services/musician.service";
import { OK } from "../constants/http-code.constant";

// get musicians ID handler
export const getMusicianIdsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { musicians, type, createIfAbsent } = musicianSchema.parse(req.body);

    const musicianIds = await Promise.all(
      musicians?.map(async (musician) => {
        const { id } = await getMusicianId({
          name: musician,
          type,
          createIfAbsent,
        });

        return id;
      }) || []
    );

    return res.status(OK).json(musicianIds);
  } catch (error) {
    next(error);
  }
};
