import { RequestHandler } from "express";
import { getMonthlyStatsZodSchema } from "../schemas/stats.zod";
import { getMonthlyStats } from "../services/stats.service";
import { HttpCode } from "@joytify/shared-types/constants";

const { OK } = HttpCode;

export const getMonthlyStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { userId, yearMonth } = getMonthlyStatsZodSchema.parse(req.params);
    const { timezone } = req.query;

    const monthlyStats = await getMonthlyStats({
      userId,
      yearMonth,
      timezone: timezone as string,
    });

    res.status(OK).json(monthlyStats);
  } catch (error) {
    next(error);
  }
};
