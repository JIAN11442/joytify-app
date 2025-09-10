import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/types/constants";
import { SearchContentByTypeRequest, SearchContentByTypeResponse } from "@joytify/types/types";

const { SEARCHES } = API_ENDPOINTS;

export const getSearchContentByType = async (
  params: SearchContentByTypeRequest
): Promise<SearchContentByTypeResponse> => {
  const { type, query, page } = params;

  return API.get(`${SEARCHES}/${type}`, { params: { query, page } });
};
