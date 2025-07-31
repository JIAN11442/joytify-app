import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import { GetMonthlyStatsRequest, PopulatedMonthlyStatsResponse } from "@joytify/shared-types/types";

const { STATS } = API_ENDPOINTS;

export const getMonthlyStats = async (
  params: GetMonthlyStatsRequest
): Promise<PopulatedMonthlyStatsResponse> => {
  const { userId, yearMonth, timezone } = params;
  const queryParams = timezone ? { timezone } : {};
  return API.get(`${STATS}/monthly/${userId}/${yearMonth}`, { params: queryParams });
};
