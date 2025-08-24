import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import {
  CreateLabelRequest,
  GetLabelIdRequest,
  LabelOptionsType,
  LabelResponse,
  RefactorInputLabelResponse,
  RefactorSearchLabelResponse,
} from "@joytify/shared-types/types";

const { LABELS } = API_ENDPOINTS;

// get label id
export const getLabelId = async (params: GetLabelIdRequest): Promise<string> =>
  await API.get(`${LABELS}/getId`, { params });

// get user all labels
export const getLabels = async (
  types?: LabelOptionsType[],
  sortBySequence?: boolean
): Promise<RefactorInputLabelResponse> => {
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
  API.post(`${LABELS}`, params);

// get label by id
export const getLabelById = async (labelId: string): Promise<RefactorSearchLabelResponse> =>
  API.get(`${LABELS}/${labelId}`);

// get recommended labels
export const getRecommendedLabels = async (
  labelId: string
): Promise<RefactorSearchLabelResponse[]> => API.get(`${LABELS}/recommendations/${labelId}`);

// remove label
export const removeLabel = async (labelId: string): Promise<LabelResponse> =>
  API.patch(`${LABELS}/remove/${labelId}`);
