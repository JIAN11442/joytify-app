import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import API from "../config/api-client.config";
import {
  CreateLabelRequest,
  GetLabelIdRequest,
  LabelOptionsType,
  LabelResponse,
  RefactorLabelResponse,
} from "@joytify/shared-types/types";

const { LABELS } = API_ENDPOINTS;

// get user all labels
export const getLabels = async (
  types?: LabelOptionsType[],
  sortBySequence?: boolean
): Promise<RefactorLabelResponse> => {
  const query =
    types && types.length > 0
      ? sortBySequence
        ? `types=${types.join(",")}&sort_by_sequence=${sortBySequence}`
        : `types=${types.join(",")}`
      : "";

  return API.get(`${LABELS}?${query}`);
};

// create label
export const createLabel = async (params: CreateLabelRequest): Promise<LabelResponse> =>
  API.post(`${LABELS}/create`, params);

// get label id
export const getLabelId = async (params: GetLabelIdRequest): Promise<string> =>
  await API.get(`${LABELS}/getId`, { params });

// remove label
export const removeLabel = async (labelId: string): Promise<LabelResponse> =>
  API.patch(`${LABELS}/remove/${labelId}`);
