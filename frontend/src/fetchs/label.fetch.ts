import API from "../config/api-client.config";
import { resLabels } from "../constants/data-type.constant";
import { LabelType } from "../constants/label-type.constant";

export const getUserLabels = (): Promise<resLabels> => API.get("/label");

interface createLabelProps {
  label: string;
  type: LabelType;
}

export const createLabel = (data: createLabelProps) =>
  API.post("/label/create", data);

interface deleteLabelProps extends createLabelProps {
  id: string;
}

export const deleteLabel = (data: deleteLabelProps) => {
  const { id, ...props } = data;

  return API.delete(`/label/delete/${id}`, { data: props });
};
