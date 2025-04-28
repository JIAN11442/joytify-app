import API from "../config/api-client.config";
import {
  CreateLabelRequest,
  GetLabelIdRequest,
  LabelOptionsType,
  LabelResponse,
  RefactorLabelResponse,
} from "@joytify/shared-types/types";

// get user all labels
export const getLabels = async (
  types?: LabelOptionsType[],
  sortBySequence?: boolean
): Promise<RefactorLabelResponse> => {
  const query =
    types && types.length > 0
      ? sortBySequence
        ? `?types=${types.join(",")}&sort_by_sequence=${sortBySequence}`
        : `?types=${types.join(",")}`
      : "";

  return API.get(`/label${query}`);
};

// create label
export const createLabel = async (params: CreateLabelRequest): Promise<LabelResponse> =>
  API.post("/label/create", params);

// remove label
export const removeLabel = async (id: string): Promise<LabelResponse> =>
  API.patch(`/label/remove/${id}`);

// get label id
export const getLabelId = async (params: GetLabelIdRequest): Promise<string> =>
  await API.post("/label/getId", params);
