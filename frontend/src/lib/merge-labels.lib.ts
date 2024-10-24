import { Label } from "../constants/data-type.constant";

const mergeLabels = (labels: Label[], joinType: string) => {
  return labels.map((label) => label.label).join(joinType);
};

export default mergeLabels;
