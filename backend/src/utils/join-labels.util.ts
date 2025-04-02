export const joinLabels = (labels: string[], joinType: string = ", ") => {
  const label = labels.join(joinType);

  return label;
};
