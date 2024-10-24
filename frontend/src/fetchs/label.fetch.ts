import API from "../config/api-client.config";
import { resLabels } from "../constants/data-type.constant";
import { LabelType } from "../constants/label-type.constant";

interface createLabelParams {
  label: string;
  type: LabelType;
}

interface getLabelIdsParams {
  labels: string[] | null;
  type: LabelType;
  createIfAbsent?: boolean;
}

interface deleteLabelParams extends createLabelParams {
  id: string;
}

// get user all labels
export const getUserLabels = (): Promise<resLabels> => API.get("/label");

// create label
export const createLabel = (data: createLabelParams) =>
  API.post("/label/create", data);

// get label ids
export const getLabelIds = async (data: getLabelIdsParams) =>
  await API.post("/label/getIds", data);

// delete label
export const deleteLabel = (data: deleteLabelParams) => {
  const { id, ...props } = data;

  return API.delete(`/label/delete/${id}`, { data: props });
};
