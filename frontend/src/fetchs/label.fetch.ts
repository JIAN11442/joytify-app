import API from "../config/api-client.config";
import {
  CreateLabelRequest,
  GetLabelsIdRequest,
  LabelResponse,
  RefactorLabelResponse,
} from "@joytify/shared-types/types";

// get user all labels
export const getUserLabels = async (): Promise<RefactorLabelResponse> => API.get("/label");

// create label
export const createLabel = async (params: CreateLabelRequest): Promise<LabelResponse> =>
  API.post("/label/create", params);

// remove label
export const removeLabel = async (id: string): Promise<LabelResponse> =>
  API.patch(`/label/remove/${id}`);

// get labels id(*)
export const getLabelsId = async (params: GetLabelsIdRequest) =>
  await API.post("/label/getIds", params);
