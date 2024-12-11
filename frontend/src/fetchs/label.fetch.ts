import API from "../config/api-client.config";
import {
  refactorResLabel,
  resLabel,
} from "../constants/axios-response.constant";
import { LabelType } from "../constants/label.constant";

interface createLabelParams {
  label: string;
  type: LabelType;
}

interface getLabelIdsParams {
  labels: string[] | null | undefined;
  type: LabelType;
  createIfAbsent?: boolean;
}

// get user all labels
export const getUserLabels = async (): Promise<refactorResLabel> =>
  API.get("/label");

// create label
export const createLabel = async (data: createLabelParams): Promise<resLabel> =>
  API.post("/label/create", data);

// get label ids
export const getLabelIds = async (data: getLabelIdsParams) =>
  await API.post("/label/getIds", data);

// delete label
export const deleteLabel = async (id: string): Promise<resLabel> =>
  API.delete(`/label/delete/${id}`);
